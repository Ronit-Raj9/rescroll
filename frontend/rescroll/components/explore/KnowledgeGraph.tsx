import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Define types for the nodes and links
interface Node {
  id: string;
  label: string;
  size: number;
  color: string;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Sample data for the knowledge graph
const GRAPH_DATA = {
  nodes: [
    { id: '1', label: 'Machine Learning', size: 25, color: '#3498db' },
    { id: '2', label: 'Deep Learning', size: 20, color: '#2980b9' },
    { id: '3', label: 'Neural Networks', size: 18, color: '#9b59b6' },
    { id: '4', label: 'Computer Vision', size: 15, color: '#8e44ad' },
    { id: '5', label: 'NLP', size: 22, color: '#2ecc71' },
    { id: '6', label: 'Transformers', size: 16, color: '#27ae60' },
    { id: '7', label: 'Reinforcement Learning', size: 18, color: '#e74c3c' },
    { id: '8', label: 'Generative AI', size: 20, color: '#c0392b' },
    { id: '9', label: 'Ethics in AI', size: 15, color: '#f39c12' },
  ] as Node[],
  links: [
    { source: '1', target: '2', strength: 0.7 },
    { source: '1', target: '3', strength: 0.6 },
    { source: '1', target: '5', strength: 0.5 },
    { source: '1', target: '7', strength: 0.4 },
    { source: '2', target: '3', strength: 0.8 },
    { source: '2', target: '4', strength: 0.6 },
    { source: '3', target: '4', strength: 0.7 },
    { source: '3', target: '6', strength: 0.5 },
    { source: '5', target: '6', strength: 0.9 },
    { source: '5', target: '8', strength: 0.6 },
    { source: '7', target: '8', strength: 0.5 },
    { source: '8', target: '9', strength: 0.6 },
  ] as Link[],
};

// Simple force-directed graph simulation
interface ForceGraphProps {
  nodes: Node[];
  links: Link[];
  width: number;
  height: number;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ nodes, links, width, height }) => {
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [graphScale] = useState(new Animated.Value(0.8));

  // Initialize node positions
  useEffect(() => {
    const initialPositions: Record<string, NodePosition> = {};
    nodes.forEach((node) => {
      initialPositions[node.id] = {
        x: Math.random() * width * 0.6 + width * 0.2,
        y: Math.random() * height * 0.6 + height * 0.2,
        vx: 0,
        vy: 0,
      };
    });
    setNodePositions(initialPositions);

    // Animate in the graph
    Animated.timing(graphScale, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [width, height, nodes, graphScale]);

  // Simulate force-directed layout
  useEffect(() => {
    if (Object.keys(nodePositions).length === 0) return;

    const timer = setInterval(() => {
      const newPositions = { ...nodePositions };

      // Apply forces
      links.forEach(({ source, target, strength }) => {
        if (!newPositions[source] || !newPositions[target]) return;

        const sourcePos = newPositions[source];
        const targetPos = newPositions[target];
        
        // Calculate distance and direction
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Optimal distance based on node sizes
        const optimalDistance = 100;
        
        // Force strength
        const force = (distance - optimalDistance) * 0.01 * strength;
        
        if (distance > 0) {
          // Normalized direction
          const dirX = dx / distance;
          const dirY = dy / distance;
          
          // Apply forces in opposite directions
          newPositions[source].vx += dirX * force;
          newPositions[source].vy += dirY * force;
          newPositions[target].vx -= dirX * force;
          newPositions[target].vy -= dirY * force;
        }
      });

      // Center force to keep nodes from flying away
      Object.keys(newPositions).forEach(id => {
        const pos = newPositions[id];
        const centerForceX = (width / 2 - pos.x) * 0.001;
        const centerForceY = (height / 2 - pos.y) * 0.001;
        
        pos.vx += centerForceX;
        pos.vy += centerForceY;
        
        // Apply velocity and damping
        pos.x += pos.vx;
        pos.y += pos.vy;
        pos.vx *= 0.9;
        pos.vy *= 0.9;
        
        // Boundary constraints
        const padding = 30;
        if (pos.x < padding) pos.x = padding;
        if (pos.x > width - padding) pos.x = width - padding;
        if (pos.y < padding) pos.y = padding;
        if (pos.y > height - padding) pos.y = height - padding;
      });

      setNodePositions(newPositions);
    }, 50);

    return () => clearInterval(timer);
  }, [nodePositions, links, width, height]);

  // Handle node selection
  const handleNodePress = (node: Node) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  // Colors for the graph - always use light mode
  const linkColor = 'rgba(0, 0, 0, 0.1)';
  const textColor = Colors.light.text;

  return (
    <Animated.View style={[styles.graphContainer, { transform: [{ scale: graphScale }] }]}>
      <Svg width={width} height={height}>
        {/* Links */}
        {links.map((link, index) => {
          const sourcePos = nodePositions[link.source];
          const targetPos = nodePositions[link.target];
          if (!sourcePos || !targetPos) return null;

          return (
            <Line
              key={`link-${index}`}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke={linkColor}
              strokeWidth={link.strength * 3}
            />
          );
        })}
        
        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          const isSelected = selectedNode?.id === node.id;

          return (
            <G key={`node-${node.id}`}>
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={node.size}
                fill={node.color}
                opacity={isSelected ? 1 : 0.8}
                onPress={() => handleNodePress(node)}
              />
            </G>
          );
        })}
      </Svg>

      {/* Node labels */}
      {nodes.map((node) => {
        const pos = nodePositions[node.id];
        if (!pos) return null;
        const isSelected = selectedNode?.id === node.id;

        return (
          <View
            key={`label-${node.id}`}
            style={[
              styles.nodeLabel,
              {
                left: pos.x - 50,
                top: pos.y + node.size + 5,
                opacity: isSelected ? 1 : 0.8,
                backgroundColor: isSelected ? node.color : 'transparent'
              },
            ]}
          >
            <Pressable onPress={() => handleNodePress(node)}>
              <ThemedText
                style={[
                  styles.nodeLabelText,
                  isSelected && { color: 'white', fontWeight: 'bold' }
                ]}
              >
                {node.label}
              </ThemedText>
            </Pressable>
          </View>
        );
      })}

      {/* Selected node details */}
      {selectedNode && (
        <View style={styles.nodeDetails}>
          <View style={[styles.nodeDetailHeader, { backgroundColor: selectedNode.color }]}>
            <ThemedText style={styles.nodeDetailTitle}>{selectedNode.label}</ThemedText>
            <TouchableOpacity onPress={() => setSelectedNode(null)}>
              <IconSymbol name="xmark.circle.fill" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <ThemedView style={styles.nodeDetailContent}>
            <ThemedText style={styles.nodeDetailText}>
              {selectedNode.label} is connected to {
                links.filter(link => 
                  link.source === selectedNode.id || link.target === selectedNode.id
                ).length
              } other topics
            </ThemedText>
            <TouchableOpacity style={styles.nodeDetailButton}>
              <ThemedText style={styles.nodeDetailButtonText}>
                View Related Papers
              </ThemedText>
              <IconSymbol name="arrow.right" size={16} color={textColor} />
            </TouchableOpacity>
          </ThemedView>
        </View>
      )}
    </Animated.View>
  );
};

export function KnowledgeGraph({ topics = [] }) {
  const [dimensions] = useState({
    width: Dimensions.get('window').width - 30,
    height: 360
  });

  return (
    <ThemedView style={styles.container}>
      <ForceGraph
        nodes={GRAPH_DATA.nodes}
        links={GRAPH_DATA.links}
        width={dimensions.width}
        height={dimensions.height}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  graphContainer: {
    width: '100%',
    position: 'relative',
  },
  nodeLabel: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  nodeLabelText: {
    fontSize: 10,
    textAlign: 'center',
  },
  nodeDetails: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  nodeDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  nodeDetailTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nodeDetailContent: {
    padding: 15,
  },
  nodeDetailText: {
    marginBottom: 10,
  },
  nodeDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nodeDetailButtonText: {
    fontWeight: '500',
  },
}); 