// This file is a fallback for using MaterialIcons on Android and web.

import { Image, StyleSheet, ImageStyle } from 'react-native';
import React from 'react';
import { OpaqueColorValue, StyleProp } from 'react-native';

// Add your local image mappings here.
const MAPPING = {
  'house.fill': require('../../assets/icons/house_fill.png'),
  'magnifyingglass': require('../../assets/icons/magnifying_glass.png'),
  'bookmark.fill': require('../../assets/icons/bookmark_fill.png'),
  'star.fill': require('../../assets/icons/star_fill.png'),
  'safari': require('../../assets/icons/safari.png'),
  'bell': require('../../assets/icons/bell.png'),
  'person.circle': require('../../assets/icons/person_circle.png'),
  // Additional icons used in the app
  'arrow.right': require('../../assets/icons/arrow_right.png'),
  'heart': require('../../assets/icons/heart.png'),
  'bookmark': require('../../assets/icons/bookmark.png'),
  'square.and.arrow.up': require('../../assets/icons/share.png'),
  'doc.text': require('../../assets/icons/document.png'),
  // Using existing icons as fallbacks for profile-related icons
  'xmark': require('../../assets/icons/person_circle.png'), // Using person_circle as fallback
  'pencil': require('../../assets/icons/share.png'), // Using share as fallback
  'moon.fill': require('../../assets/icons/star_fill.png'), // Using star.fill as fallback
  'gear': require('../../assets/icons/safari.png'), // Using safari as fallback
  'chevron.right': require('../../assets/icons/arrow_right.png'), // Using arrow_right as fallback
  'lock.fill': require('../../assets/icons/bookmark_fill.png'), // Using bookmark.fill as fallback
  'questionmark.circle.fill': require('../../assets/icons/person_circle.png'), // Using person_circle as fallback
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses local images. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on local images.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ImageStyle>;
}) {
  const icon = MAPPING[name];
  
  // Create base style
  const baseStyle: ImageStyle = {
    width: size,
    height: size,
    tintColor: color,
  };
  
  return <Image source={icon} style={[baseStyle, style]} />;
}
