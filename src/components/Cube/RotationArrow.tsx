import { Vector3, Euler } from 'three'

interface RotationArrowProps {
  axis: 'x' | 'y' | 'z'
  layer: number
  direction: 1 | -1
}

const RotationArrow = ({ axis, layer, direction }: RotationArrowProps) => {
  // Position: Center of the rotating layer
  const position = new Vector3(
    axis === 'x' ? layer : 0,
    axis === 'y' ? layer : 0,
    axis === 'z' ? layer : 0
  )

  // Rotation to align with axis
  const rotation = new Euler(0, 0, 0)
  if (axis === 'x') rotation.z = Math.PI / 2
  if (axis === 'z') rotation.x = Math.PI / 2

  // Direction indicator
  // We'll draw a torus arc to show the path
  // And a cone at the end to show direction

  return (
    <group position={position} rotation={rotation}>
      {/* Ring indicating the layer */}
      <mesh>
        <torusGeometry args={[2.2, 0.05, 16, 100]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>

      {/* Active rotation indicator */}
      <group rotation={[Math.PI / 2, 0, 0]}> {/* Rotate to lie flat on the plane perpendicular to axis */}
        <mesh rotation={[0, 0, direction === 1 ? 0 : Math.PI]}>
          <torusGeometry args={[2.2, 0.15, 16, 50, Math.PI / 2]} />
          <meshStandardMaterial color="#1890ff" emissive="#1890ff" emissiveIntensity={0.8} />
        </mesh>

        {/* Arrow head */}
        <mesh position={[
          2.2 * Math.cos(direction === 1 ? Math.PI / 2 : Math.PI / 2),
          2.2 * Math.sin(direction === 1 ? Math.PI / 2 : Math.PI / 2),
          0
        ]}
          rotation={[0, 0, direction === 1 ? Math.PI : 0]}
        >
          <coneGeometry args={[0.3, 0.6, 16]} />
          <meshStandardMaterial color="#1890ff" emissive="#1890ff" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export default RotationArrow
