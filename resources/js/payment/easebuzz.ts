import { loadScript, type PaymentInitResult } from './base';

export type EasebuzzPayload = {
  ezcheckout?: {
    access_key: string;
    key: string; // merchant key
    env: 'test' | 'prod';
  };
  environment?: 'test' | 'live';
  returnUrl: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { EasebuzzCheckout?: any }
}

function submitForm(action: string, method: string, fields: Record<string, any>) {
  const form = document.createElement('form');
  form.method = method || 'POST';
  form.action = action;
  form.style.display = 'none';
  Object.entries(fields || {}).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = typeof v === 'string' ? v : JSON.stringify(v);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export async function initEasebuzz(payload: any): Promise<PaymentInitResult> {
  try {
    console.log('initEasebuzz called with payload:', payload);
    
    // Client requires iframe checkout only
    if (payload?.ezcheckout) {
      console.log('Attempting Easebuzz iframe checkout...');
      const res = await initEasebuzzIframe(payload);
      if (res.ok) {
        console.log('Easebuzz iframe checkout initiated successfully');
        return res;
      }
      console.warn('Easebuzz iframe failed:', res.message);
      return res; // Return the failure instead of falling back
    }
    
    return { ok: false, message: 'Easebuzz iframe configuration missing.' };
  } catch (e: any) {
    console.error('Easebuzz init error:', e);
    return { ok: false, message: e?.message || 'Failed to initialize Easebuzz.' };
  }
}

async function initEasebuzzIframe(payload: any): Promise<PaymentInitResult> {
  try {
    console.log('initEasebuzzIframe called with payload:', payload);
    
    // Load the Easebuzz checkout script first
    try {
      await loadScript('https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/easebuzz-checkout.js');
      console.log('Easebuzz script loaded successfully');
    } catch (err) {
      console.error('Failed to load Easebuzz script:', err);
      return { ok: false, message: 'Failed to load Easebuzz checkout script.' };
    }
    
    if ((window as any).easebuzzCheckoutActive) {
      console.warn('Easebuzz checkout is already active');
      return { ok: false, message: 'Payment window is already open.' };
    }

    // Mark as active to prevent multiple instances
    (window as any).easebuzzCheckoutActive = true;
    
    console.log('EasebuzzCheckout available?', !!(window as any).EasebuzzCheckout);
    
    if (!(window as any).EasebuzzCheckout) {
      (window as any).easebuzzCheckoutActive = false;
      throw new Error('Easebuzz checkout script not loaded');
    }

    // Get the ezcheckout data
    const ezData = payload.ezcheckout || payload;
    console.log('Using ezData:', ezData);
    
    if (!ezData.key || !ezData.access_key) {
      (window as any).easebuzzCheckoutActive = false;
      throw new Error('Missing required Easebuzz parameters: key or access_key');
    }
    
    const cleanup = () => {
      (window as any).easebuzzCheckoutActive = false;
      
      // Remove backdrop if it exists
      const backdrop = document.getElementById('easebuzz-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      
      // Remove loading skeleton if it exists
      const skeleton = document.getElementById('easebuzz-loading-skeleton');
      if (skeleton) {
        skeleton.remove();
      }
      
      // Stop observing iframe changes and clear protection interval
      const easebuzzIframe = document.querySelector('iframe[id*="easebuzz-checkout-frame"]');
      if (easebuzzIframe) {
        // Disconnect MutationObserver
        if ((easebuzzIframe as any).__easebuzzObserver) {
          (easebuzzIframe as any).__easebuzzObserver.disconnect();
          delete (easebuzzIframe as any).__easebuzzObserver;
        }
        
        // Clear protection interval
        if ((easebuzzIframe as any).__easebuzzProtectionInterval) {
          clearInterval((easebuzzIframe as any).__easebuzzProtectionInterval);
          delete (easebuzzIframe as any).__easebuzzProtectionInterval;
        }
      }
    };

    // Follow the EXACT official Easebuzz SDK pattern
    console.log('Creating EasebuzzCheckout instance...');
    const easebuzzCheckout = new (window as any).EasebuzzCheckout(ezData.key, ezData.env || "test");
    
    // Use the exact same options structure as the official example
    const options = {
      access_key: ezData.access_key,
      onResponse: (response_data: any) => {
        console.log('Easebuzz onResponse called:', response_data);
        cleanup();
        try {
          // Create a form to send the response data back to our server
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = payload.returnUrl;
          
          // Add the response data as form fields
          if (response_data && typeof response_data === 'object') {
            Object.keys(response_data).forEach(key => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = response_data[key] || '';
              form.appendChild(input);
            });
          }
          
          document.body.appendChild(form);
          form.submit();
        } catch (err) {
          console.error('Easebuzz onResponse error', err);
          try { window.dispatchEvent(new CustomEvent('easebuzz:error', { detail: err })); } catch {}
        }
      },
      theme: ezData.theme || payload.theme || '#0F6CBD'
    };

    console.log('Easebuzz options:', options);
    
    try {
      console.log('Calling easebuzzCheckout.initiatePayment...');
      easebuzzCheckout.initiatePayment(options);
      console.log('easebuzzCheckout.initiatePayment called successfully');
      
      // Immediately start monitoring and preventing iframe hiding
      const preventIframeHiding = () => {
        const easebuzzIframe = document.querySelector('iframe[id*="easebuzz-checkout-frame"]');
        if (easebuzzIframe) {
          const iframe = easebuzzIframe as HTMLElement;
          
          console.log('Found Easebuzz iframe immediately, applying enhanced UX protection...');
          
          // Define consistent dimensions function - optimized to match Easebuzz content
          const getOptimalDimensions = () => ({
            width: Math.min(window.innerWidth * 0.65, 720), // Reduced to match Easebuzz content width
            height: Math.min(window.innerHeight * 0.85, 650)
          });
          
          const dimensions = getOptimalDimensions();
          
          // Apply exact dimensions to iframe immediately
          iframe.style.setProperty('display', 'block', 'important');
          iframe.style.setProperty('visibility', 'visible', 'important');
          iframe.style.setProperty('opacity', '1', 'important');
          iframe.style.setProperty('position', 'fixed', 'important');
          iframe.style.setProperty('top', '50%', 'important');
          iframe.style.setProperty('left', '50%', 'important');
          iframe.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
          iframe.style.setProperty('width', dimensions.width + 'px', 'important');
          iframe.style.setProperty('height', dimensions.height + 'px', 'important');
          iframe.style.setProperty('min-width', dimensions.width + 'px', 'important');
          iframe.style.setProperty('max-width', dimensions.width + 'px', 'important');
          iframe.style.setProperty('min-height', dimensions.height + 'px', 'important');
          iframe.style.setProperty('max-height', dimensions.height + 'px', 'important');
          iframe.style.setProperty('z-index', '999999', 'important');
          iframe.style.setProperty('border', '2px solid #ddd', 'important');
          iframe.style.setProperty('border-radius', '12px', 'important');
          iframe.style.setProperty('box-shadow', '0 8px 32px rgba(0,0,0,0.2)', 'important');
          iframe.style.setProperty('background', '#ffffff', 'important');
          
          console.log('Applied iframe dimensions:', dimensions);
          
          // Add loading skeleton overlay with exactly matching dimensions
          const createLoadingSkeleton = () => {
            // Use the exact same dimensions function as iframe
            const skeletonDimensions = getOptimalDimensions();
            console.log('Applied skeleton dimensions:', skeletonDimensions);
            
            const skeletonOverlay = document.createElement('div');
            skeletonOverlay.id = 'easebuzz-loading-skeleton';
            skeletonOverlay.style.cssText = `
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              width: ${skeletonDimensions.width}px !important;
              height: ${skeletonDimensions.height}px !important;
              z-index: 1000000 !important;
              background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
              border-radius: 12px !important;
              border: 2px solid #e2e8f0 !important;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              overflow: hidden !important;
            `;
            
            skeletonOverlay.innerHTML = `
              <div style="text-align: center; padding: 2rem; width: 100%;">
                <!-- Animated Logo/Icon -->
                <div style="
                  width: 64px; 
                  height: 64px; 
                  border: 4px solid #e2e8f0; 
                  border-top: 4px solid #3b82f6; 
                  border-radius: 50%; 
                  animation: spin 1s linear infinite;
                  margin: 0 auto 1.5rem auto;
                "></div>
                
                <!-- Loading Text -->
                <h3 style="
                  margin: 0 0 0.5rem 0; 
                  font-size: 1.25rem; 
                  font-weight: 600; 
                  color: #1f2937;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">Preparing Your Payment</h3>
                <p style="
                  margin: 0 0 2rem 0; 
                  color: #6b7280; 
                  font-size: 0.9rem;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">Please wait while we set up your secure checkout...</p>
                
                <!-- Enhanced Content Skeleton for wider space -->
                <div style="width: 100%; max-width: 500px; margin: 0 auto;">
                  <!-- Header skeleton -->
                  <div style="
                    height: 50px; 
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                    border-radius: 8px; 
                    margin-bottom: 1.5rem;
                    animation: shimmer 2s infinite;
                  "></div>
                  
                  <!-- Two column layout for payment methods -->
                  <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <div style="
                      flex: 1;
                      height: 60px; 
                      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                      border-radius: 8px; 
                      animation: shimmer 2s infinite;
                      animation-delay: 0.2s;
                    "></div>
                    <div style="
                      flex: 1;
                      height: 60px; 
                      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                      border-radius: 8px; 
                      animation: shimmer 2s infinite;
                      animation-delay: 0.4s;
                    "></div>
                  </div>
                  
                  <!-- Payment options skeleton -->
                  <div style="
                    height: 40px; 
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                    border-radius: 6px; 
                    margin-bottom: 0.75rem;
                    animation: shimmer 2s infinite;
                    animation-delay: 0.6s;
                  "></div>
                  <div style="
                    height: 40px; 
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                    border-radius: 6px; 
                    margin-bottom: 0.75rem;
                    width: 85%;
                    animation: shimmer 2s infinite;
                    animation-delay: 0.8s;
                  "></div>
                  <div style="
                    height: 40px; 
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                    border-radius: 6px; 
                    margin-bottom: 1.5rem;
                    width: 90%;
                    animation: shimmer 2s infinite;
                    animation-delay: 1s;
                  "></div>
                  
                  <!-- Action button skeleton -->
                  <div style="
                    height: 48px; 
                    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); 
                    border-radius: 8px;
                    animation: shimmer 2s infinite;
                    animation-delay: 1.2s;
                  "></div>
                </div>
              </div>
              
              <!-- CSS Animations -->
              <style>
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes shimmer {
                  0% { background-position: -200px 0; }
                  100% { background-position: calc(200px + 100%) 0; }
                }
                #easebuzz-loading-skeleton div[style*="shimmer"] {
                  background-size: 200px 100%;
                  background-repeat: no-repeat;
                }
              </style>
            `;
            
            return skeletonOverlay;
          };
          
          // Show skeleton initially
          const skeleton = createLoadingSkeleton();
          document.body.appendChild(skeleton);
          
          // Add backdrop if it doesn't exist
          if (!document.getElementById('easebuzz-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'easebuzz-backdrop';
            backdrop.style.cssText = `
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background-color: rgba(0,0,0,0.5) !important;
              z-index: 999998 !important;
            `;
            
            // Add close functionality to backdrop
            backdrop.onclick = (e) => {
              if (e.target === backdrop) {
                console.log('Backdrop clicked, closing Easebuzz popup');
                cleanup();
                try { window.dispatchEvent(new CustomEvent('easebuzz:closed')); } catch {}
              }
            };
            
            document.body.appendChild(backdrop);
          }
          
          // Enhanced protection that maintains optimal dimensions and handles skeleton
          let contentLoaded = false;
          
          const protectIframe = () => {
            // Use the same dimensions function for consistency
            const currentDimensions = getOptimalDimensions();
            
            iframe.style.setProperty('display', 'block', 'important');
            iframe.style.setProperty('visibility', 'visible', 'important');
            iframe.style.setProperty('opacity', '1', 'important');
            iframe.style.setProperty('position', 'fixed', 'important');
            iframe.style.setProperty('top', '50%', 'important');
            iframe.style.setProperty('left', '50%', 'important');
            iframe.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            iframe.style.setProperty('z-index', '999999', 'important');
            
            // Force exact dimensions every time - override Easebuzz sizing
            iframe.style.setProperty('width', currentDimensions.width + 'px', 'important');
            iframe.style.setProperty('height', currentDimensions.height + 'px', 'important');
            
            // Also set min and max to lock the size
            iframe.style.setProperty('min-width', currentDimensions.width + 'px', 'important');
            iframe.style.setProperty('max-width', currentDimensions.width + 'px', 'important');
            iframe.style.setProperty('min-height', currentDimensions.height + 'px', 'important');
            iframe.style.setProperty('max-height', currentDimensions.height + 'px', 'important');
            
            console.log('Forced iframe to exact dimensions:', currentDimensions);
            
            // Check if iframe content has loaded by examining its document
            try {
              const iframeElement = iframe as HTMLIFrameElement;
              const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;
              const hasContent = iframeDoc && (
                iframeDoc.body?.innerHTML?.trim().length > 100 ||
                iframeDoc.querySelectorAll('div, form, input').length > 3
              );
              
              if (hasContent && !contentLoaded) {
                contentLoaded = true;
                console.log('Easebuzz content loaded, removing skeleton...');
                
                // Smooth transition: fade out skeleton
                const skeleton = document.getElementById('easebuzz-loading-skeleton');
                if (skeleton) {
                  skeleton.style.transition = 'opacity 0.3s ease-out';
                  skeleton.style.opacity = '0';
                  setTimeout(() => skeleton.remove(), 300);
                }
                
                // Ensure iframe is properly visible
                iframe.style.setProperty('transition', 'opacity 0.3s ease-in', 'important');
                setTimeout(() => {
                  iframe.style.removeProperty('transition');
                }, 300);
              }
            } catch (e) {
              // Cross-origin iframe - use timeout-based fallback
              if (!contentLoaded) {
                setTimeout(() => {
                  if (!contentLoaded) {
                    contentLoaded = true;
                    const skeleton = document.getElementById('easebuzz-loading-skeleton');
                    if (skeleton) {
                      skeleton.style.transition = 'opacity 0.3s ease-out';
                      skeleton.style.opacity = '0';
                      setTimeout(() => skeleton.remove(), 300);
                    }
                    console.log('Content assumed loaded (cross-origin), removing skeleton...');
                  }
                }, 3000); // Remove skeleton after 3 seconds as fallback
              }
            }
            
            // Ensure parent containers aren't hiding it
            let parent = iframe.parentElement;
            while (parent && parent !== document.body) {
              parent.style.setProperty('display', 'block', 'important');
              parent.style.setProperty('visibility', 'visible', 'important');
              parent.style.setProperty('opacity', '1', 'important');
              parent = parent.parentElement;
            }
          };
          
          // Smart mutation observer that works with SDK's resize process
          const observer = new MutationObserver((mutations) => {
            let needsProtection = false;
            
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes') {
                if (mutation.attributeName === 'style') {
                  // Check if this is a legitimate resize or a hide attempt
                  const computedStyle = window.getComputedStyle(iframe);
                  const isHidden = computedStyle.display === 'none' || 
                                 computedStyle.visibility === 'hidden' || 
                                 computedStyle.opacity === '0';
                  
                  if (isHidden) {
                    needsProtection = true;
                    console.log('Detected hiding attempt via style change');
                  } else {
                    console.log('Style change detected - checking dimensions...');
                    // Let the protectIframe function handle dimension logic
                    needsProtection = true;
                  }
                } else if (mutation.attributeName === 'class' || 
                          mutation.attributeName === 'hidden') {
                  needsProtection = true;
                  console.log('Detected hiding attempt via class/hidden attribute');
                }
              } else if (mutation.type === 'childList') {
                // Check if iframe was moved or removed
                if (!document.contains(iframe)) {
                  console.log('Iframe was removed from DOM');
                  return;
                }
                needsProtection = true;
              }
            });
            
            if (needsProtection) {
              protectIframe();
            }
          });
          
          // Observe the iframe and its parent containers
          observer.observe(iframe, { 
            attributes: true, 
            childList: true,
            subtree: false
          });
          
          // Also observe parent containers
          let parent = iframe.parentElement;
          while (parent && parent !== document.body) {
            observer.observe(parent, { 
              attributes: true, 
              attributeFilter: ['style', 'class', 'hidden'] 
            });
            parent = parent.parentElement;
          }
          
          // Enhanced continuous monitoring with skeleton management
          const protectionInterval = setInterval(() => {
            if (!document.contains(iframe)) {
              clearInterval(protectionInterval);
              return;
            }
            
            // Check if iframe is being hidden
            const computedStyle = window.getComputedStyle(iframe);
            const isHidden = computedStyle.display === 'none' || 
                           computedStyle.visibility === 'hidden' || 
                           computedStyle.opacity === '0';
            
            const actualWidth = parseInt(computedStyle.width);
            const actualHeight = parseInt(computedStyle.height);
            
            if (isHidden) {
              protectIframe();
              console.log('Continuous protection: Re-applied iframe visibility');
            } else if (contentLoaded) {
              const minDimensions = getOptimalDimensions();
              if (actualWidth !== minDimensions.width || actualHeight !== minDimensions.height) {
                // Force exact dimensions if they don't match perfectly
                protectIframe();
                console.log('Continuous protection: Forced iframe to exact dimensions');
              }
            }
          }, 250); // Check every 250ms
          
          // Store both observer and interval for cleanup
          (iframe as any).__easebuzzObserver = observer;
          (iframe as any).__easebuzzProtectionInterval = protectionInterval;
          
          // Store both observer and interval for cleanup
          (iframe as any).__easebuzzObserver = observer;
          (iframe as any).__easebuzzProtectionInterval = protectionInterval;
          
          console.log('Enhanced Easebuzz iframe protection activated with loading skeleton');
          return true;
        }
        return false;
      };
      
      // Try immediately and keep trying until iframe is found
      const findIframeInterval = setInterval(() => {
        if (preventIframeHiding()) {
          clearInterval(findIframeInterval);
        }
      }, 100);
      
      // Stop trying after 5 seconds
      setTimeout(() => {
        clearInterval(findIframeInterval);
      }, 5000);
      
    } catch (initError) {
      console.error('Error calling initiatePayment:', initError);
      cleanup();
      throw initError;
    }

    // Set up a timeout to detect if popup never appears
    const watchdog = window.setTimeout(() => {
      console.log('Easebuzz checkout timeout - checking if popup appeared...');
      
      // Check for any Easebuzz elements
      const easebuzzElements = document.querySelectorAll('[id*="easebuzz"], [class*="easebuzz"], [src*="easebuzz"]');
      console.log('Found Easebuzz elements:', easebuzzElements.length);
      
      if (easebuzzElements.length === 0) {
        console.log('No Easebuzz popup detected - likely blocked or failed');
        cleanup();
        try { window.dispatchEvent(new CustomEvent('easebuzz:timeout')); } catch {}
      } else {
        console.log('Easebuzz popup elements found, extending timeout...');
        // Extend timeout if popup is detected
      }
    }, 10_000);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      cleanup();
      clearTimeout(watchdog);
    }, { once: true });
    
    console.log('Easebuzz iframe setup completed');
    return { ok: true };
  } catch (e: any) {
    console.error('Easebuzz iframe init error:', e);
    console.error('Error details:', {
      message: e?.message,
      stack: e?.stack,
      name: e?.name
    });
    (window as any).easebuzzCheckoutActive = false;
    return { ok: false, message: e?.message || 'Failed to initialize Easebuzz.' };
  }
}