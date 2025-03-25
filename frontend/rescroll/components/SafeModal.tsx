import React, { useRef } from 'react';
import { Modal, View, ModalProps, StyleSheet } from 'react-native';

interface SafeModalProps extends ModalProps {
  children: React.ReactNode;
}

const SafeModal: React.FC<SafeModalProps> = ({ children, ...props }) => {
  const containerRef = useRef<View>(null);

  return (
    <Modal {...props}>
      <View 
        ref={containerRef} 
        style={styles.container}
        collapsable={false} // This helps with findDOMNode warnings
      >
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeModal; 