import { type SharedData } from '@/types';
import { Country, Currency, Purpose, FormErrors } from '@/types/donation';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { DonationFormData, State } from '@/types/donation';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DonationFormPageProps extends SharedData {
  countries: Country[];
  currencies: Currency[];
  purposes: Purpose[];
  detectedCountry?: Country;
  errors?: FormErrors;
}

export default function DonationFormPage() {
    const { auth, countries, currencies, purposes, detectedCountry, errors } = usePage<DonationFormPageProps>().props;

        // --- Begin inlined DonationForm logic ---
        const [formData, setFormData] = useState<DonationFormData>({
            country: detectedCountry?.id || '',
            purpose: '',
            currency: detectedCountry?.default_currency || '',
            amount: '1',
            address_line_1: '',
            address_line_2: '',
            state: '',
            city: '',
            zip_code: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            phone: '',
            phone_country_code: detectedCountry?.phone_code || '',
            tax_exemption: false,
            pan_number: '',
            documents: [{ type: '', file: null }],
            skip_kyc: false,
            terms_accepted: false,
        });
        const [states, setStates] = useState<State[]>([]);
        const [localErrors, setLocalErrors] = useState<FormErrors>(errors || {});
        const [isLoading, setIsLoading] = useState(false);
        const [currencySymbol, setCurrencySymbol] = useState('$');
        const [symbolWidth, setSymbolWidth] = useState(20);

        const calculateSymbolWidth = (symbol: string) => {
            const baseWidth = 20; const charWidth = symbol.length * 8; const extraWidth = symbol.match(/[₹£€]/) ? 4 : 0; return Math.max(baseWidth, charWidth + extraWidth + 16);
        };
        const countryOptions: ComboboxOption[] = countries.map(c => ({ value: c.id, label: c.name, extra: c.code }));
        const currencyOptions: ComboboxOption[] = currencies.map(c => ({ value: c.id, label: `${c.name} (${c.code})`, extra: c.symbol }));
        const purposeOptions: ComboboxOption[] = purposes.map(p => ({ value: p.id, label: p.name, extra: (<div className="flex items-center gap-1"><span>{p.icon}</span><span className="text-xs text-muted-foreground">{p.category}</span></div>) }));
        const stateOptions: ComboboxOption[] = states.map(s => ({ value: s.id, label: s.name, extra: s.code }));
        const calculateCodeWidth = (code: string) => { const baseWidth=80; const charWidth=8; const padding=16; return Math.max(baseWidth, (code?.length||3)*charWidth + padding); };
        const phoneCodeOptions: ComboboxOption[] = countries.map(c => ({ value: c.phone_code, label: `${c.flag_icon} ${c.phone_code}` }));
        const loadStates = async (countryId: string, selectedStateId?: string) => { if(!countryId){ setStates([]); return;} try { const resp = await fetch(`/api/states?country_id=${countryId}`); const data = await resp.json(); setStates(data); if(selectedStateId){ setFormData(p=>({...p,state:selectedStateId})); } else { setFormData(p=>({...p,state:''})); } } catch { setStates([]);} };
        useEffect(()=>{ if(formData.currency){ const c = currencies.find(c=>c.id===formData.currency); const sym = c?.symbol || '$'; setCurrencySymbol(sym); setSymbolWidth(calculateSymbolWidth(sym));}}, [formData.currency, currencies]);
        useEffect(()=>{ if(detectedCountry && detectedCountry.states){ setStates(detectedCountry.states);} else if(detectedCountry){ loadStates(detectedCountry.id);} }, [detectedCountry]);
        const handleInputChange = (name:string, value:any) => { setFormData(p=>({...p,[name]:value})); if(localErrors[name]){ setLocalErrors(prev=>{ const ne={...prev}; delete ne[name]; return ne;}); } };
        const handleCountryChange = (id:string)=>{ handleInputChange('country', id); if(id){ const c=countries.find(c=>c.id===id); if(c){ handleInputChange('currency', c.default_currency); const phoneCode = c.phone_code.startsWith('+')? c.phone_code: `+${c.phone_code}`; handleInputChange('phone_country_code', phoneCode); if(c.states){ setStates(c.states); setFormData(p=>({...p,state:''})); } else { loadStates(id);} } } else { setStates([]); setFormData(p=>({...p,state:''})); } };
        const addDocument = () => setFormData(p=>({...p, documents:[...p.documents,{type:'',file:null}]}));
        const removeDocument = (i:number)=>{ if(formData.documents.length>1){ setFormData(p=>({...p, documents:p.documents.filter((_,idx)=>idx!==i)})); } };
        const updateDocument = (index:number, field:'type'|'file', value:any)=>{ setFormData(p=>({...p, documents:p.documents.map((d,i)=> i===index?{...d,[field]:value}:d)})); const key=`documents.${index}.${field}`; if(localErrors[key]){ setLocalErrors(prev=>{ const ne={...prev}; delete ne[key]; if(ne.documents && typeof ne.documents==='string') delete ne.documents; return ne; }); } };
        const handleSubmit = async (e:React.FormEvent)=>{ e.preventDefault(); setIsLoading(true); setLocalErrors({}); try { const fd = new FormData(); Object.entries(formData).forEach(([k,v])=>{ if(k==='documents'){ formData.documents.forEach((doc,i)=>{ fd.append(`documents[${i}][type]`, doc.type); if(doc.file) fd.append(`documents[${i}][file]`, doc.file as File); }); } else if(typeof v==='boolean'){ fd.append(k, v? '1':'0'); } else { fd.append(k, v.toString()); } }); router.post('/donation/process', fd, { onSuccess:()=>{}, onError:(errs)=>{ setLocalErrors(errs as FormErrors); setIsLoading(false);} }); } catch { setIsLoading(false);} };

        return (
            <>
                <Head title="Make a Donation" />
                <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                    <header className="mb-6 w-full max-w-7xl px-6 pt-6">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-2xl font-bold text-blue-600">SRPS Donation</div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]">Dashboard</Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]">Log in</Link>
                                        <Link href={route('register')} className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]">Register</Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </header>
                    <main className="flex-1 w-full">
                        <div className="min-h-screen bg-gray-50 py-8">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="bg-white rounded-lg shadow-lg p-8">
                                    <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proceed to Pay</h1>
                                        <p className="text-gray-600">Complete your donation details below</p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <Card>
                                            <CardHeader><CardTitle className="flex items-center"><span className="mr-2">🎁</span>Donation Details</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                                                        <Combobox options={countryOptions} value={formData.country} onValueChange={handleCountryChange} placeholder="Select Country" searchPlaceholder="Search countries..." emptyText="No country found." className={localErrors.country ? 'border-red-500':''} />
                                                        {localErrors.country && <p className="mt-1 text-sm text-red-600">{localErrors.country}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Purpose <span className="text-red-500">*</span></label>
                                                        <Combobox options={purposeOptions} value={formData.purpose} onValueChange={(v)=>handleInputChange('purpose', v)} placeholder="Select Purpose" searchPlaceholder="Search donation purposes..." emptyText="No purpose found." className={localErrors.purpose ? 'border-red-500':''} />
                                                        {localErrors.purpose && <p className="mt-1 text-sm text-red-600">{localErrors.purpose}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency <span className="text-red-500">*</span></label>
                                                        <Combobox options={currencyOptions} value={formData.currency} onValueChange={(v)=>handleInputChange('currency', v)} placeholder="Select Currency" searchPlaceholder="Search currencies..." emptyText="No currency found." className={localErrors.currency ? 'border-red-500':''} />
                                                        {localErrors.currency && <p className="mt-1 text-sm text-red-600">{localErrors.currency}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10" style={{width:`${symbolWidth+12}px`}}><span className="text-gray-500 text-sm font-medium">{currencySymbol}</span></div>
                                                            <Input type="text" value={formData.amount} onChange={(e)=>handleInputChange('amount', e.target.value)} placeholder="Enter Amount to Pay" className={localErrors.amount ? 'border-red-500':''} style={{paddingLeft:`${symbolWidth+12}px`}} />
                                                        </div>
                                                        {localErrors.amount && <p className="mt-1 text-sm text-red-600">{localErrors.amount}</p>}
                                                        <p className="mt-1 text-sm text-gray-500">Processing fee as 5% of total amount would be charged.</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                                                                {/* Billing Address Section */}
                                                                                <Card>
                                                                                    <CardHeader><CardTitle className="flex items-center"><span className="mr-2">📍</span>Billing Address</CardTitle></CardHeader>
                                                                                    <CardContent>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
                                                                                                <Input type="text" value={formData.address_line_1} onChange={(e)=>handleInputChange('address_line_1', e.target.value)} placeholder="Address 1" className={localErrors.address_line_1 ? 'border-red-500':''} />
                                                                                                {localErrors.address_line_1 && <p className="mt-1 text-sm text-red-600">{localErrors.address_line_1}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                                                                                                <Input type="text" value={formData.address_line_2} onChange={(e)=>handleInputChange('address_line_2', e.target.value)} placeholder="Address 2" className={localErrors.address_line_2 ? 'border-red-500':''} />
                                                                                                {localErrors.address_line_2 && <p className="mt-1 text-sm text-red-600">{localErrors.address_line_2}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province <span className="text-red-500">*</span></label>
                                                                                                <Combobox options={stateOptions} value={formData.state} onValueChange={(v)=>handleInputChange('state', v)} placeholder="Select State" searchPlaceholder="Search states..." emptyText="No state found." className={localErrors.state ? 'border-red-500':''} />
                                                                                                {localErrors.state && <p className="mt-1 text-sm text-red-600">{localErrors.state}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                                                                                                <Input type="text" value={formData.city} onChange={(e)=>handleInputChange('city', e.target.value)} placeholder="Enter city name" className={localErrors.city ? 'border-red-500':''} />
                                                                                                {localErrors.city && <p className="mt-1 text-sm text-red-600">{localErrors.city}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pin/Zip Code <span className="text-red-500">*</span></label>
                                                                                                <Input type="text" value={formData.zip_code} onChange={(e)=>handleInputChange('zip_code', e.target.value)} placeholder="Enter Pin/Zip Code" className={localErrors.zip_code ? 'border-red-500':''} />
                                                                                                {localErrors.zip_code && <p className="mt-1 text-sm text-red-600">{localErrors.zip_code}</p>}
                                                                                            </div>
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>

                                                                                {/* Donor Information Section */}
                                                                                <Card>
                                                                                    <CardHeader><CardTitle className="flex items-center"><span className="mr-2">👤</span>Donor Information</CardTitle></CardHeader>
                                                                                    <CardContent>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                                                                                                <Input type="text" value={formData.first_name} onChange={(e)=>handleInputChange('first_name', e.target.value)} placeholder="First name" className={localErrors.first_name ? 'border-red-500':''} />
                                                                                                {localErrors.first_name && <p className="mt-1 text-sm text-red-600">{localErrors.first_name}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                                                                                                <Input type="text" value={formData.middle_name} onChange={(e)=>handleInputChange('middle_name', e.target.value)} placeholder="Middle name" className={localErrors.middle_name ? 'border-red-500':''} />
                                                                                                {localErrors.middle_name && <p className="mt-1 text-sm text-red-600">{localErrors.middle_name}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                                                                                                <Input type="text" value={formData.last_name} onChange={(e)=>handleInputChange('last_name', e.target.value)} placeholder="Last name" className={localErrors.last_name ? 'border-red-500':''} />
                                                                                                {localErrors.last_name && <p className="mt-1 text-sm text-red-600">{localErrors.last_name}</p>}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                                                                                                <Input type="email" value={formData.email} onChange={(e)=>handleInputChange('email', e.target.value)} placeholder="Your email" className={localErrors.email ? 'border-red-500':''} />
                                                                                                {localErrors.email && <p className="mt-1 text-sm text-red-600">{localErrors.email}</p>}
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                                                                                <div className={`flex rounded-md ${localErrors.phone || localErrors.phone_country_code || localErrors.phone_combined ? 'ring-1 ring-red-500' : ''}`}>
                                                                                                    <div className="relative" style={{minWidth:'fit-content', width:`${calculateCodeWidth(formData.phone_country_code)}px`}}>
                                                                                                        <Combobox options={phoneCodeOptions} value={formData.phone_country_code} onValueChange={(v)=>handleInputChange('phone_country_code', v)} placeholder="Code" searchPlaceholder="Search country codes..." emptyText="No country found." className="w-full rounded-r-none border-r-0 focus:border-r focus:z-10" />
                                                                                                    </div>
                                                                                                    <Input type="text" value={formData.phone} onChange={(e)=>handleInputChange('phone', e.target.value)} placeholder="Your Mobile Number" className="flex-1 rounded-l-none -ml-px focus:z-10" />
                                                                                                </div>
                                                                                                {(localErrors.phone || localErrors.phone_country_code || localErrors.phone_combined) && <p className="mt-1 text-sm text-red-600">{localErrors.phone_combined || localErrors.phone || localErrors.phone_country_code}</p>}
                                                                                            </div>
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>

                                                                                {/* Tax Exemption Section */}
                                                                                <Card>
                                                                                    <CardContent>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                            <div className="flex items-center">
                                                                                                <input type="checkbox" id="tax_exemption" checked={formData.tax_exemption} onChange={(e)=>handleInputChange('tax_exemption', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                                                                <label htmlFor="tax_exemption" className="ml-2 text-sm text-gray-700">I want a tax exemption receipt</label>
                                                                                            </div>
                                                                                            {formData.tax_exemption && (
                                                                                                <div>
                                                                                                    <Input type="text" placeholder="Enter PAN Number" value={formData.pan_number} onChange={(e)=>handleInputChange('pan_number', e.target.value)} className={localErrors.pan_number ? 'border-red-500':''} />
                                                                                                    {localErrors.pan_number && <p className="mt-1 text-sm text-red-600">{localErrors.pan_number}</p>}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </CardContent>
                                                                                </Card>

                                                                                {/* KYC Documents Section */}
                                                                                {!formData.skip_kyc && (
                                                                                    <div>
                                                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                                                                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center"><span className="mr-2">🆔</span>KYC Documents</h2>
                                                                                            <Button type="button" variant="outline" onClick={addDocument} className="text-blue-700 border-blue-300 hover:bg-blue-50 w-full sm:w-auto">➕ Add Document</Button>
                                                                                        </div>
                                                                                        <p className="text-sm text-gray-600 mb-4">Upload at least one government-issued identity document. You can add multiple documents if needed.</p>
                                                                                        {localErrors.documents && typeof localErrors.documents === 'string' && (
                                                                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"><p className="text-sm text-red-600">{localErrors.documents}</p></div>
                                                                                        )}
                                                                                        <div className="space-y-4">
                                                                                            {formData.documents.map((document, index)=>(
                                                                                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                                                        <div>
                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type <span className="text-red-500">*</span></label>
                                                                                                            <Input type="text" value={document.type} onChange={(e)=>updateDocument(index,'type', e.target.value)} placeholder="Enter Document Type" className={localErrors[`documents.${index}.type`] ? 'border-red-500':''} />
                                                                                                            {localErrors[`documents.${index}.type`] && <p className="mt-1 text-sm text-red-600">{localErrors[`documents.${index}.type`]}</p>}
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Document Copy <span className="text-red-500">*</span></label>
                                                                                                            <div className="flex items-center gap-2">
                                                                                                                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e)=>updateDocument(index,'file', e.target.files?.[0] || null)} className={`flex-1 min-w-0 h-9 px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:mr-2 border rounded-md shadow-xs bg-transparent transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${localErrors[`documents.${index}.file`] ? 'border-red-500 aria-invalid:ring-destructive/20':'border-input'}`} />
                                                                                                                {formData.documents.length>1 && (
                                                                                                                    <Button type="button" variant="outline" size="sm" onClick={()=>removeDocument(index)} className="flex-shrink-0 h-9 w-9 p-0 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                                                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                                                                    </Button>
                                                                                                                )}
                                                                                                            </div>
                                                                                                            {localErrors[`documents.${index}.file`] && <p className="mt-1 text-sm text-red-600">{localErrors[`documents.${index}.file`]}</p>}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <p className="mt-2 text-sm text-gray-500">Supported formats: JPG, PNG, PDF (Max 5MB each)</p>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Alternative Upload Option */}
                                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex items-center text-blue-800"><span className="mr-2">ℹ️</span><strong className="text-base">Alternative</strong></div>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                            <div className="text-sm text-blue-700">
                                                                                                <p> You can also email your documents to{' '}<a href="mailto:doc@srpsshikshasamiti.com" className="underline hover:text-blue-900 font-medium">doc@srpsshikshasamiti.com</a></p>
                                                                                            </div>
                                                                                            <div className="flex items-center justify-start md:justify-end">
                                                                                                <input type="checkbox" id="skip_kyc" checked={formData.skip_kyc} onChange={(e)=>handleInputChange('skip_kyc', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                                                                                <label htmlFor="skip_kyc" className="ml-2 text-sm font-medium text-blue-800">I will provide documents via email</label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Terms and Conditions */}
                                                                                <div>
                                                                                    <div className="flex items-center">
                                                                                        <input type="checkbox" id="terms_accepted" checked={formData.terms_accepted} onChange={(e)=>handleInputChange('terms_accepted', e.target.checked)} className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${localErrors.terms_accepted ? 'border-red-500':''}`} />
                                                                                        <label htmlFor="terms_accepted" className="ml-2 text-sm text-gray-700">Check here to indicate that you have read and agree to the{' '}<a href="#" target="_blank" className="text-blue-600 underline hover:text-blue-800">terms and conditions</a></label>
                                                                                    </div>
                                                                                    {localErrors.terms_accepted && <p className="mt-1 text-sm text-red-600">{localErrors.terms_accepted}</p>}
                                                                                </div>

                                                                                <div className="flex justify-center">
                                                                                    <Button type="submit" disabled={isLoading} size="lg" className="px-8">
                                                                                        {isLoading ? (<><div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>Processing...</>) : (<>💳 Pay Now</>)}
                                                                                    </Button>
                                                                                </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
}
