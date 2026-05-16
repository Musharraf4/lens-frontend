import React from 'react';
import { useNumberContext } from '@/store/CreateNumberContext';
import { Input } from '@/components/ui/input';

export function useCallConfigurationSettingsStep() {
  const {
    phoneNumber,
    setPhoneNumber,
    numberName,
    setNumberName,
    swapNumber,
    setSwapNumber,
    forwardingNumber,
    setForwardingNumber,
  } = useNumberContext();

  return [
    {
      id: 1,
      label: 'Choose where to direct the calls',
      body: (
        <div className='w-1/2'>
          <Input
            label='Enter existing phone number'
            placeholder="Phone number"
            value={forwardingNumber}
            onChange={e => setForwardingNumber(e.target.value)}
            type="tel"
          />
        </div>
      ),
    },
    {
      id: 2,
      label: 'Name the Number',
      body: (
        <div>
          <Input
            className='w-1/2'
            label='Name the number for easier tracking and management and identification'
            placeholder="Number name"
            value={numberName}
            onChange={e => setNumberName(e.target.value)}
          />
        </div>
      ),
    },
    {
      id: 3,
      label: 'Add the number to swap with your tracking numbers',
      body: (
        <div>
          <Input
            className='w-1/2'
            label='Set the website number to swap with tracking numbers, usually the same as the destination number'
            placeholder="Phone number"
            value={swapNumber}
            onChange={e => setSwapNumber(e.target.value)}
            type="tel"
          />
        </div>
      ),
    },
  ];
}
