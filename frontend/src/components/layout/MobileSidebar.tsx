import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  Icon,
  Flex,
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: any;
  children: string;
  to: string;
  onClose: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link to={to} style={{ textDecoration: 'none', width: '100%' }} onClick={onClose}>
      <Flex
        align="center"
        p="4"
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

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      size="xs"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            OddGenius
          </Text>
        </DrawerHeader>
        <DrawerBody>
          <VStack spacing={1} align="stretch">
            <NavItem icon={FiHome} to="/dashboard" onClose={onClose}>
              Dashboard
            </NavItem>
            <NavItem icon={FiPlay} to="/live" onClose={onClose}>
              Live Matches
            </NavItem>
            <NavItem icon={FiClock} to="/upcoming" onClose={onClose}>
              Upcoming
            </NavItem>
            <NavItem icon={FiGlobe} to="/leagues" onClose={onClose}>
              Leagues
            </NavItem>
            <NavItem icon={FiStar} to="/premium-tips" onClose={onClose}>
              Premium Tips
            </NavItem>
            <NavItem icon={FiMessageCircle} to="/odd-genius-ai" onClose={onClose}>
              Odd Genius AI
            </NavItem>
            {/* AI Team navigation removed */}
            <NavItem icon={FiUser} to="/profile" onClose={onClose}>
              Profile
            </NavItem>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSidebar;
