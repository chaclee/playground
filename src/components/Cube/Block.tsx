import { Vector3, Euler, Quaternion } from 'three'

interface BlockProps {
    position: [number, number, number]
    rotation: [number, number, number]
    colors: string[] // [Right, Left, Top, Bottom, Front, Back]
    animation?: {
        axis: 'x' | 'y' | 'z'
        direction: 1 | -1
        progress: number
    } | null
}

const Block = ({ position, rotation, colors, animation }: BlockProps) => {
    // Geometry: BoxGeometry args: [width, height, depth]
    // Material: Array of 6 materials for each face

    // Calculate dynamic rotation
    const currentRotation = new Euler(...rotation)
    const currentPosition = new Vector3(...position)

    if (animation) {
        const { axis, direction, progress } = animation
        const angle = direction * Math.PI / 2 * progress
        const axisVector = new Vector3(
            axis === 'x' ? 1 : 0,
            axis === 'y' ? 1 : 0,
            axis === 'z' ? 1 : 0
        )

        // Rotate position around axis
        // Note: We assume rotation around (0,0,0) which is correct for the cube center
        // But we need to rotate only if we are in the layer?
        // The parent component already filters which blocks get the animation prop.
        // So we just apply the rotation.

        currentPosition.applyAxisAngle(axisVector, angle)

        // Rotate orientation
        const q = new Quaternion().setFromEuler(currentRotation)
        const qRot = new Quaternion().setFromAxisAngle(axisVector, angle)
        q.premultiply(qRot)
        currentRotation.setFromQuaternion(q)
    }

    return (
        <mesh
            position={currentPosition}
            rotation={currentRotation}
        >
            <boxGeometry args={[0.95, 0.95, 0.95]} />
            {colors.map((color, index) => (
                <meshStandardMaterial key={index} attach={`material-${index}`} color={color} />
            ))}
        </mesh>
    )
}

export default Block
