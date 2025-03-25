import React, { useRef, forwardRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface SafeGestureHandlerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Using forwardRef to properly handle ref forwarding
const SafeGestureHandler = forwardRef<View, SafeGestureHandlerProps>(
  ({ children, style }, ref) => {
    // Create a local ref if no ref is provided
    const localRef = useRef<View>(null);
    const resolvedRef = ref || localRef;

    return (
      <View ref={resolvedRef} style={[styles.container, style]}>
        <GestureHandlerRootView style={styles.gestureContainer}>
          {children}
        </GestureHandlerRootView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
});

export default SafeGestureHandler; 