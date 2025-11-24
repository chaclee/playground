import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Button, Space, Card, Slider, Typography } from 'antd'
import { useState } from 'react'
import Block from './Block'
import RotationArrow from './RotationArrow'
import { useCubeLogic } from '../../hooks/useCubeLogic'

const { Text } = Typography

interface CubeSceneProps {
    cubies: ReturnType<typeof useCubeLogic>['cubies']
    currentMove: ReturnType<typeof useCubeLogic>['currentMove']
    finishMove: ReturnType<typeof useCubeLogic>['finishMove']
    speed: number
}

const CubeScene = ({ cubies, currentMove, finishMove, speed }: CubeSceneProps) => {
    const [progress, setProgress] = useState(0)

    useFrame((_, delta) => {
        if (currentMove) {
            setProgress((prev: number) => {
                const newProgress = prev + delta * speed
                if (newProgress >= 1) {
                    finishMove()
                    return 0
                }
                return newProgress
            })
        }
    })

    return (
        <group>
            {cubies.map((cubie) => (
                <Block
                    key={cubie.id}
                    position={cubie.position}
                    rotation={cubie.rotation}
                    colors={cubie.colors}
                    animation={currentMove && (
                        (currentMove.axis === 'x' && Math.abs(cubie.position[0] - currentMove.layer) < 0.1) ||
                        (currentMove.axis === 'y' && Math.abs(cubie.position[1] - currentMove.layer) < 0.1) ||
                        (currentMove.axis === 'z' && Math.abs(cubie.position[2] - currentMove.layer) < 0.1)
                    ) ? { ...currentMove, progress: progress } : null}
                />
            ))}
            {currentMove && (
                <RotationArrow
                    axis={currentMove.axis}
                    layer={currentMove.layer}
                    direction={currentMove.direction}
                />
            )}
        </group>
    )
}

const getMoveDescription = (move: { axis: 'x' | 'y' | 'z', layer: number, direction: 1 | -1 } | null) => {
    if (!move) return 'Ready'
    const { axis, layer, direction } = move
    let face = ''
    if (axis === 'y' && layer === 1) face = 'Top (Up)'
    if (axis === 'y' && layer === -1) face = 'Bottom (Down)'
    if (axis === 'x' && layer === 1) face = 'Right'
    if (axis === 'x' && layer === -1) face = 'Left'
    if (axis === 'z' && layer === 1) face = 'Front'
    if (axis === 'z' && layer === -1) face = 'Back'

    const dirText = direction === 1 ? 'Counter-Clockwise' : 'Clockwise'; // Check direction logic
    // Standard:
    // R (x=1) 1 is CCW? Need to verify standard notation vs our math.
    // Usually +angle is CCW around axis.

    return `Rotating ${face} ${dirText} `
}

const RubiksCube = () => {
    const { cubies, rotateLayer, solve, scramble, isAnimating, isSolved, currentMove, finishMove, checkSolved } = useCubeLogic()
    const [speed, setSpeed] = useState(2) // Default speed 2

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Environment preset="city" />
                <CubeScene cubies={cubies} currentMove={currentMove} finishMove={finishMove} speed={speed} />
                <OrbitControls makeDefault />
            </Canvas>

            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 'max-content' }}>
                <Card size="small" title="Controls">
                    <Space orientation="vertical" align="center" style={{ width: 300 }}>
                        <div style={{ width: '100%', textAlign: 'center', marginBottom: 10 }}>
                            <Text strong>{getMoveDescription(currentMove)}</Text>
                        </div>

                        <Space>
                            <Button onClick={() => rotateLayer('y', 1, -1)} disabled={isAnimating}>U</Button>
                            <Button onClick={() => rotateLayer('y', -1, -1)} disabled={isAnimating}>D</Button>
                            <Button onClick={() => rotateLayer('x', 1, -1)} disabled={isAnimating}>R</Button>
                            <Button onClick={() => rotateLayer('x', -1, 1)} disabled={isAnimating}>L</Button>
                            <Button onClick={() => rotateLayer('z', 1, -1)} disabled={isAnimating}>F</Button>
                            <Button onClick={() => rotateLayer('z', -1, 1)} disabled={isAnimating}>B</Button>
                        </Space>

                        <div style={{ width: '100%' }}>
                            <Text type="secondary">Animation Speed</Text>
                            <Slider
                                min={0.5}
                                max={10}
                                step={0.5}
                                value={speed}
                                onChange={setSpeed}
                                disabled={isAnimating}
                            />
                        </div>

                        <Space>
                            <Button danger onClick={solve} disabled={isAnimating}>还原 (Reset)</Button>
                            <Button type="primary" onClick={scramble} disabled={isAnimating}>打乱 (Scramble)</Button>
                        </Space>
                        <Button size="small" type="dashed" onClick={() => {
                            const result = checkSolved(cubies)
                            if (!result) {
                                // Find failing cubie for debug
                                const fail = cubies.find(c => {
                                    const expectedX = Math.floor(c.id / 9) - 1
                                    const expectedY = (Math.floor(c.id / 3) % 3) - 1
                                    const expectedZ = (c.id % 3) - 1
                                    const pos = c.position
                                    if (Math.round(pos[0]) !== expectedX || Math.round(pos[1]) !== expectedY || Math.round(pos[2]) !== expectedZ) return true
                                    return false
                                })
                                if (fail) {
                                    alert(`Validation Failed: Cubie ${fail.id} at [${fail.position}] expected [${Math.floor(fail.id / 9) - 1}, ${(Math.floor(fail.id / 3) % 3) - 1}, ${(fail.id % 3) - 1}]`)
                                } else {
                                    alert('Validation Failed: Positions correct, but rotations incorrect.')
                                }
                            }
                            else alert('Validation Passed: Cube IS solved.')
                        }}>Verify Result</Button>
                        {isSolved && <div style={{ color: '#52c41a', fontWeight: 'bold', marginTop: 8 }}>✨ Solved!</div>}
                    </Space>
                </Card>
            </div>
        </div>
    )
}

export default RubiksCube
