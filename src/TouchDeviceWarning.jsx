import React, { useState, useEffect } from 'react';

const TouchDeviceWarning = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      try {
        return (('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0) ||
          (navigator.msMaxTouchPoints > 0));
      } catch (e) {
        return false;
      }
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  if (!isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
      <div className="mx-4 w-full max-w-md bg-yellow-50 bg-opacity-95 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">Touch Device Detected</h3>
            <p className="text-yellow-700">
              This timeline application is designed for mouse and keyboard interaction. Touch devices are not fully supported and some features may not work as expected. For the best experience, please use a device with a mouse.
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-yellow-800 hover:text-yellow-900 text-xl pl-4"
            aria-label="Close warning"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default TouchDeviceWarning;