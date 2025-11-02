declare module '@expo/vector-icons' {
  import { ComponentProps } from 'react';
  
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export const Ionicons: React.ComponentType<IconProps>;
}

