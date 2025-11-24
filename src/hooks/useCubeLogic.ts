import { useState, useCallback, useRef, useEffect } from 'react'
import { Vector3, Quaternion, Euler } from 'three'

export type Position = [number, number, number]
export type Rotation = [number, number, number]
// Right, Left, Top, Bottom, Front, Back
export type CubeColors = [string, string, string, string, string, string]

export interface Cubie {
    id: number
    position: Position
    rotation: Rotation
    colors: CubeColors
}

const INITIAL_COLORS: CubeColors = [
    '#ff0000', // Right - Red (红色)
    '#ffa500', // Left - Orange (橙色)
    '#ffffff', // Top - White (白色)
    '#ffff00', // Bottom - Yellow (黄色)
    '#008000', // Front - Green (绿色)
    '#0000ff', // Back - Blue (蓝色)
]

export const useCubeLogic = () => {
    const [cubies, setCubies] = useState<Cubie[]>(() => {
        const initialCubies: Cubie[] = []
        let id = 0
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    initialCubies.push({
                        id: id++,
                        position: [x, y, z],
                        rotation: [0, 0, 0],
                        colors: [...INITIAL_COLORS]
                    })
                }
            }
        }
        return initialCubies
    })

    const [isAnimating, setIsAnimating] = useState(false)
    const [isSolved, setIsSolved] = useState(true)



    const [moveQueue, setMoveQueue] = useState<{ axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1, skipHistory?: boolean }[]>([])
    const [currentMove, setCurrentMove] = useState<{ axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1, skipHistory?: boolean } | null>(null)

    const [isSolving, setIsSolving] = useState(false)

    // Process queue
    useEffect(() => {
        if (!currentMove && moveQueue.length > 0) {
            const nextMove = moveQueue[0]
            setMoveQueue(prev => prev.slice(1))
            setCurrentMove(nextMove)
        } else if (!currentMove && moveQueue.length === 0 && isSolving) {
            // Solving finished, force snap to initial state to ensure perfection
            setCubies(prev => {
                const initialCubies: Cubie[] = []
                let id = 0
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let z = -1; z <= 1; z++) {
                            initialCubies.push({
                                id: id++,
                                position: [x, y, z],
                                rotation: [0, 0, 0],
                                colors: [...INITIAL_COLORS]
                            })
                        }
                    }
                }
                return initialCubies
            })
            setIsSolved(true)
            setIsSolving(false)
        }
    }, [currentMove, moveQueue, isSolving])

    const moveHistory = useRef<{ axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1 }[]>([])
    const checkSolved = useCallback((currentCubies: Cubie[]) => {
        const isSolved = currentCubies.every(cubie => {
            // Calculate expected position based on ID
            // ID generation:
            // let id = 0
            // for (let x = -1; x <= 1; x++) {
            //   for (let y = -1; y <= 1; y++) {
            //     for (let z = -1; z <= 1; z++) {

            // Reverse ID to position
            // z = (id % 3) - 1
            // y = (Math.floor(id / 3) % 3) - 1
            // x = (Math.floor(id / 9)) - 1

            const expectedX = Math.floor(cubie.id / 9) - 1
            const expectedY = (Math.floor(cubie.id / 3) % 3) - 1
            const expectedZ = (cubie.id % 3) - 1

            const pos = cubie.position

            // Check position (integer coordinates)
            if (Math.round(pos[0]) !== expectedX ||
                Math.round(pos[1]) !== expectedY ||
                Math.round(pos[2]) !== expectedZ) {
                return false
            }

            // Check rotation
            // Should be equivalent to 0 rotation (Identity quaternion)
            // We check if the local axes match the global axes.
            // Or simply check if Euler angles are multiples of 2PI (360 degrees)
            // But Euler angles can be messy.
            // Better: Convert to Quaternion and check angle to Identity.

            const q = new Quaternion().setFromEuler(new Euler(...cubie.rotation))
            const identity = new Quaternion()

            // Angle between q and identity
            // 2 * acos(|q . identity|)
            // If q is close to identity, dot product is close to 1 (or -1 due to double cover).

            const dot = Math.abs(q.dot(identity))
            // dot should be close to 1

            return dot > 0.99 // Allow small floating point error
        })

        setIsSolved(isSolved)
        return isSolved
    }, [])

    const rotateLayer = useCallback((axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1) => {
        // Add to queue
        setMoveQueue(prev => [...prev, { axis, layer, direction }])
        // DO NOT Add to history here. Wait for finishMove.
    }, [])

    const applyMove = (cubies: Cubie[], move: { axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1 }): Cubie[] => {
        const { axis, layer, direction } = move
        return cubies.map(cubie => {
            const pos = new Vector3(...cubie.position)

            let inLayer = false
            if (axis === 'x' && Math.abs(pos.x - layer) < 0.1) inLayer = true
            if (axis === 'y' && Math.abs(pos.y - layer) < 0.1) inLayer = true
            if (axis === 'z' && Math.abs(pos.z - layer) < 0.1) inLayer = true

            if (!inLayer) return cubie

            const angle = direction * Math.PI / 2
            const axisVector = new Vector3(
                axis === 'x' ? 1 : 0,
                axis === 'y' ? 1 : 0,
                axis === 'z' ? 1 : 0
            )
            pos.applyAxisAngle(axisVector, angle)

            pos.x = Math.round(pos.x)
            pos.y = Math.round(pos.y)
            pos.z = Math.round(pos.z)

            const rot = new Euler(...cubie.rotation)
            const q = new Quaternion().setFromEuler(rot)
            const qRot = new Quaternion().setFromAxisAngle(axisVector, angle)
            q.premultiply(qRot)
            const newRot = new Euler().setFromQuaternion(q)

            // Snap rotation to nearest PI/2 to prevent drift
            newRot.x = Math.round(newRot.x / (Math.PI / 2)) * (Math.PI / 2)
            newRot.y = Math.round(newRot.y / (Math.PI / 2)) * (Math.PI / 2)
            newRot.z = Math.round(newRot.z / (Math.PI / 2)) * (Math.PI / 2)

            return {
                ...cubie,
                position: [pos.x, pos.y, pos.z] as Position,
                rotation: [newRot.x, newRot.y, newRot.z] as Rotation
            }
        })
    }

    const finishMove = useCallback(() => {
        if (!currentMove) return

        setCubies(prev => {
            const newCubies = applyMove(prev, currentMove)
            checkSolved(newCubies)
            return newCubies
        })

        // Add to history only if executed and not skipped
        if (!currentMove.skipHistory) {
            const { axis, layer, direction } = currentMove
            moveHistory.current.push({ axis, layer, direction })
        }

        setCurrentMove(null)
    }, [currentMove, checkSolved])

    const reset = useCallback(() => {
        setMoveQueue([])
        setCurrentMove(null)
        moveHistory.current = []
        setCubies(prev => {
            const initialCubies: Cubie[] = []
            let id = 0
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        initialCubies.push({
                            id: id++,
                            position: [x, y, z],
                            rotation: [0, 0, 0],
                            colors: [...INITIAL_COLORS]
                        })
                    }
                }
            }
            setIsSolved(true)
            return initialCubies
        })
    }, [])

    const solve = useCallback(() => {
        if (moveHistory.current.length === 0) return

        const inverseMoves = [...moveHistory.current].reverse().map(move => ({
            ...move,
            direction: (move.direction * -1) as 1 | -1,
            skipHistory: true // Do not record solution moves in history
        }))

        // Clear history so we don't loop if we solve again (though button should be disabled)
        moveHistory.current = []

        setMoveQueue(prev => [...prev, ...inverseMoves])
        setIsSolving(true)
    }, [])

    const scramble = useCallback(() => {
        // Instant scramble, no animation queue for now to keep it fast
        // Or should we animate? Let's keep it instant as per standard behavior, 
        // but user might want to see it. 
        // Let's stick to instant for scramble, but clear queue first.
        setMoveQueue([])
        setCurrentMove(null)

        const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
        const layers = [-1, 0, 1]
        const directions: (1 | -1)[] = [1, -1]

        const moves: { axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1 }[] = []
        for (let i = 0; i < 20; i++) {
            moves.push({
                axis: axes[Math.floor(Math.random() * axes.length)],
                layer: layers[Math.floor(Math.random() * layers.length)],
                direction: directions[Math.floor(Math.random() * directions.length)]
            })
        }

        // Append to history instead of overwriting
        moveHistory.current.push(...moves)

        setCubies(prev => {
            let currentCubies = [...prev]
            moves.forEach(move => {
                currentCubies = applyMove(currentCubies, move)
            })
            checkSolved(currentCubies)
            return currentCubies
        })
    }, [checkSolved])

    return {
        cubies,
        rotateLayer,
        reset,
        scramble,
        solve,
        isAnimating: currentMove !== null || moveQueue.length > 0,
        isSolved,
        currentMove,
        finishMove,
        checkSolved // Expose for manual validation if needed
    }
}
