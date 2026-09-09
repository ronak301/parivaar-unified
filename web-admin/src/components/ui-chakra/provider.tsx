'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from './theme';
import { EmotionCacheProvider } from './emotion-ssr';

export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionCacheProvider>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </EmotionCacheProvider>
  );
}
