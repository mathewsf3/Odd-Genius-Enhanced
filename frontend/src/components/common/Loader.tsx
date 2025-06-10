// @ts-nocheck
import React from 'react';
import {
  Box,
  Center,
  HStack,
  keyframes,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';

interface LoaderProps {
  /** Show the loader */
  isOpen: boolean;
  /** "ring" | "dots" | "bar" */
  variant?: 'ring' | 'dots' | 'bar';
  /** Logo element – defaults to /logo.svg */
  logo?: React.ReactNode;
  /** Size of main loader area (ring diameter or dot height) */
  size?: string;
  /** Inline version w/out overlay */
  inline?: boolean;
}

/**
 * Universal "thinking" loader – pick the style with `variant`
 */
const Loader: React.FC<LoaderProps> = ({
  isOpen,
  variant = 'ring',
  logo,
  size = '6rem',
  inline = false,
}) => {
  if (!isOpen) return null;

  /* ---------- COMMON VALUES ---------- */
  const brandColor = useColorModeValue('#3182CE', '#63B3ED');
  const overlayBg = useColorModeValue('whiteAlpha.900', 'blackAlpha.800');

  const defaultLogo = (
    <Image
      src="/logo.svg"
      alt="OddGenius logo"
      w="100%"
      h="100%"
      objectFit="contain"
      pointerEvents="none"
    />
  );

  /* ---------- VARIANT: RING ---------- */
  const rotate = keyframes`
    0% { transform: rotate(0deg) }
    100% { transform: rotate(360deg) }
  `;
  const dash = keyframes`
    0%   { stroke-dashoffset: 314; opacity: .3 }
    50%  { stroke-dashoffset: 0;   opacity: 1 }
    100% { stroke-dashoffset: 314; opacity: .3 }
  `;
  const Ring = (
    <Box position="relative" w={size} h={size}>
      {/* logo in the centre */}
      <Box
        position="absolute"
        top="25%"
        left="25%"
        w="50%"
        h="50%"
        zIndex={2}
      >
        {logo || defaultLogo}
      </Box>

      {/* rotating container */}
      <Box
        position="absolute"
        inset={0}
        animation={`${rotate} 3s linear infinite`}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={brandColor}
            strokeWidth="2"
            opacity="0.15"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={brandColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="314"
            strokeDashoffset="314"
            style={{ animation: `${dash} 2s ease-in-out infinite` }}
          />
        </svg>
      </Box>
    </Box>
  );

  /* ---------- VARIANT: DOTS ---------- */
  const bounce = keyframes`
    0%, 80%, 100% { transform: translateY(0); opacity:.3 }
    40%           { transform: translateY(-8px); opacity:1 }
  `;
  const Dots = (
    <HStack spacing="6px">
      {[0, 1, 2].map(i => (
        <Box
          key={i}
          w={size}
          h={size}
          maxW="10px"
          maxH="10px"
          bg={brandColor}
          borderRadius="full"
          animation={`${bounce} 1.4s ease-in-out ${i * 0.16}s infinite`}
        />
      ))}
    </HStack>
  );

  /* ---------- VARIANT: BAR ---------- */
  const barMove = keyframes`
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  `;
  const Bar = (
    <Box
      w="200px"
      h="8px"
      overflow="hidden"
      position="relative"
      borderRadius="md"
      bg={useColorModeValue('gray.200', 'gray.700')}
    >
      <Box
        w="50%"
        h="100%"
        bg={brandColor}
        position="absolute"
        animation={`${barMove} 1.5s linear infinite`}
      />
    </Box>
  );

  /* ---------- SELECT THE RENDER ---------- */
  const content =
    variant === 'dots' ? Dots : variant === 'bar' ? Bar : Ring;

  /* ---------- INLINE OR OVERLAY ---------- */
  if (inline) {
    return <Center p={4}>{content}</Center>;
  }

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      bg={overlayBg}
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-busy="true"
    >
      {content}
    </Box>
  );
};

export default Loader;
