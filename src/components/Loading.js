import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';

const Loading = () => {
    const [dot1Opacity] = useState(new Animated.Value(0.25));
    const [dot2Opacity] = useState(new Animated.Value(0.25));
    const [dot3Opacity] = useState(new Animated.Value(0.25));

    const animateDots = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(dot1Opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(dot1Opacity, {
                    toValue: 0.25,
                    duration: 500,
                    useNativeDriver: true,
                }),

                Animated.timing(dot2Opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(dot2Opacity, {
                    toValue: 0.25,
                    duration: 500,
                    useNativeDriver: true,
                }),

                Animated.timing(dot3Opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(dot3Opacity, {
                    toValue: 0.25,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        animateDots();
    }, []);

    return (
        <View className="absolute top-0 left-0 w-screen h-screen justify-center items-center z-50">
            <View className="absolute top-0 left-0 w-screen h-screen bg-black opacity-30">

            </View>
            <View className="flex flex-row justify-center items-center gap-2">
                <Animated.View
                    style={{
                        width: 12,
                        height: 12,
                        backgroundColor: 'white',
                        borderRadius: 50,
                        opacity: dot1Opacity,
                    }}
                    className="animate-pulse"
                />
                <Animated.View
                    style={{
                        width: 12,
                        height: 12,
                        backgroundColor: 'white',
                        borderRadius: 50,
                        opacity: dot2Opacity,
                    }}
                    className="animate-pulse"
                />
                <Animated.View
                    style={{
                        width: 12,
                        height: 12,
                        backgroundColor: 'white',
                        borderRadius: 50,
                        opacity: dot3Opacity,
                    }}
                    className="animate-pulse"
                />
            </View>
        </View>
    );
};

export default Loading;
