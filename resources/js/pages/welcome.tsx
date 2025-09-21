import { type SharedData } from '@/types';
import { 
  Country, 
  Currency, 
  Purpose, 
  FormErrors 
} from '@/types/donation';
import { Head, Link, usePage } from '@inertiajs/react';
import DonationForm from '@/components/DonationForm';

interface WelcomeProps extends SharedData {
  countries: Country[];
  currencies: Currency[];
  purposes: Purpose[];
  detectedCountry?: Country;
  errors?: FormErrors;
}

export default function Welcome() {
    const { auth, countries, currencies, purposes, detectedCountry, errors } = usePage<WelcomeProps>().props;

    return (
        <>
            <Head title="Welcome - Make a Donation">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-7xl px-6 pt-6">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-blue-600">
                                SRPS Donation
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>
                
                <main className="flex-1 w-full">
                    <DonationForm
                        countries={countries || []}
                        currencies={currencies || []}
                        purposes={purposes || []}
                        detectedCountry={detectedCountry}
                        errors={errors}
                    />
                </main>
            </div>
        </>
    );
}
