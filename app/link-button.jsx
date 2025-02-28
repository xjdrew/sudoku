'use client';
import { useState } from 'react';

export default function LinkButton() {
    const [likes, setLikes] = useState(0);

    function handleClick() {
        setLikes(likes + 1);
    }

    return (<button onClick={handleClick}>Like ({likes})</button>)
}