import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiPlay,
  FiClock,
  FiStar,
  FiUser,
  FiGlobe,
  FiMessageSquare,
  FiMessageCircle,
} from 'react-icons/fi';

interface NavItemProps {
  icon: any;
  children: string;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link to={to} style={{ textDecoration: 'none', width: '100%' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : 'inherit'}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
          color: isActive ? activeColor : 'inherit',
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
        {children}
      </Flex>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      w="240px"
      pos="fixed"
      h="full"
      overflowY="auto"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="center">
        <Image
          src="/logo.svg"
          alt="OddGenius Logo"
          height="60px"
          width="auto"
          objectFit="contain"
        />
      </Flex>
      <VStack spacing={1} align="stretch">
        <NavItem icon={FiHome} to="/dashboard">
          Dashboard
        </NavItem>
        <NavItem icon={FiPlay} to="/live">
          Live Matches
        </NavItem>
        <NavItem icon={FiClock} to="/upcoming">
          Upcoming
        </NavItem>
        <NavItem icon={FiGlobe} to="/leagues">
          Leagues
        </NavItem>
        <NavItem icon={FiStar} to="/premium-tips">
          Premium Tips
        </NavItem>
        <NavItem icon={FiMessageCircle} to="/odd-genius-ai">
          Odd Genius AI
        </NavItem>
        {/* AI Team navigation removed */}
        <NavItem icon={FiUser} to="/profile">
          Profile
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;
