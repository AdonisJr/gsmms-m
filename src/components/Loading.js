import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'

export default function Loading() {
    return (
        <View className="absolute top-0 left-0 flex">
            <View className="absolute top-0 left-0 flex justify-center items-center bg-black opacity-10 z-10" />
            <View className="absolute top-0 left-0 flex justify-center items-center z-50" >
                <ActivityIndicator size="3xl" color="tomato" />
            </View>

        </View>
    )
}