import classNames from "classnames";
import { SetSortingAlgorithms, SortingAlgorithms } from "context/SortingEnum";
import { SetStateAction, useEffect, useState } from "react";
import bubbleSort from "algorithms/sorting/bubbleSort";
import insertionSort from "algorithms/sorting/insertionSort";
import { mergeSort, merge } from "algorithms/sorting/mergeSort";
import quickSort from "algorithms/sorting/quickSort";

type Props = {
    type: string;
}

export enum State {
    COMPARE = "COMPARE",
    SWAP = "SWAP",
    SORTED = "SORTED",
    INSERT = "INSERT",
    WATCH = "WATCH",
    COMPLETE = "COMPLETE"
}

const buttons = [5, 10, 15, 20, 25];
const defaultButton = buttons[2];

const speedButtons = [0.5, 1, 2]
const defaultSpeed = speedButtons[2];




function SortingVisualizer({ type }: Props) {
    // console.log(type);

    // array size
    const [size, setSize] = useState<number>(defaultButton);
    // the array of numbers to sort
    const [array, setArray] = useState<number[]>(generateArray(size));
    const [unmodifiedArray, setUnmodifiedArray] = useState<number[]>([...array]);
    const [speed, setSpeed] = useState<number>(defaultSpeed);
    const [animations, setAnimations] = useState<any[]>([]);
    const [compare, setCompare] = useState<number[]>([]);
    const [swap, setSwap] = useState<number[]>([]);
    const [sorted, setSorted] = useState<number[]>([]);
    const [timeoutarray, setTimeoutarray] = useState<[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [state, setState] = useState<State>(State.WATCH);
    const [isSorted, setIsSorted] = useState<boolean>(false);
    const [isInsert, setIsInsert] = useState<boolean>(false);
    const [sameSize, setSameSize] = useState<boolean>(false);
    // state that references all the timeouts
    const [timeouts, setTimeouts] = useState<number[] | NodeJS.Timeout[]>([])
    // state that references what position in the array is being compared
    const [position, setPosition] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [isWatching, setIsWatching] = useState<boolean>(false);


    console.log('animations', animations);
    // console.log('unmodifiedArray', unmodifiedArray);
    console.log('timeouts', timeouts);
    console.log('isWatching', isWatching);


    function generateArray(size: number, min: number = 3, max: number = 35) {
        const array: number[] = [];
        while (array.length < size) {
            const random = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!array.includes(random)) {
                array.push(random);
            }
        }
        return array;
    }

    function handleSpeedChange(speed: number) {
        setSpeed(speed);
    }

    function handleSizeChange(buttonsize: number) {
        StopTimeout()
        if (buttonsize === size) {
            setSameSize(!sameSize);
        }
        setSize(buttonsize);
        setIsComplete(false);
        setIsSorted(false);
        setIsRunning(false);
        setIsPaused(false);
        setSorted([]);
        setCompare([]);
        setSwap([]);
        const newArray = generateArray(buttonsize);
        setArray([...newArray]);
        setUnmodifiedArray([...newArray]);
        setPosition(0);
    }

    function handleStart() {
        StopTimeout();
        console.log('start');
        // setUnmodifiedArray([...array]);
        setTimeoutarray([]);
        setIsRunning(true);
        setIsWatching(true);

        animationIteration(animations);
    }



    function handleReset() {
        StopTimeout();
        setArray([...unmodifiedArray]);
        setCompare([]);
        setSwap([]);
        setSorted([]);
        setIsRunning(false);
        setIsComplete(false);
        setPosition(0);
        setIsPaused(false);
        setIsWatching(false);
        setTimeoutarray([]);
    }

    function handleStop() {
        console.log('stop');
        console.log('position', position);
        StopTimeout();
        setIsPaused(true)
        setIsRunning(false);
    }

    function handleResume() {
        StopTimeout();
        console.log('resume');
        setIsRunning(true);
        setIsPaused(false);
        animationIteration(animations);
    }

    function swapper(array: number[], i: number, j: number) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    function partition(array: number[], left: number, right: number, animations: any[]) {
        const pivot = array[right];
        animations.push({
            type: "WATCH",
            pivot: [pivot],
        });

        let i = left - 1;
        for (let j = left; j < right; j++) {
            animations.push({
                type: "COMPARE",
                payload: [array[j], pivot],
            });
            if (array[j] <= pivot) {
                i++;
            }
            if (i < j) {
                swapper(array, i, j);
                animations.push({
                    type: "SWAP",
                    payload: [array[i], array[j]],
                });
            }
    }
        swapper(array, i + 1, right);
        animations.push({
            type: "SWAP",
            payload: [array[i + 1], array[right]],
        });
        return i + 1;
}

    function quickSort(array: number[], left: number, right: number, animations: any[]) {
        if (left == right) {
            animations.push({
                type: "SORTED",
                payload: [array[left]],
            });
            return;
        }
        if (left < right) {
            const mid = partition(array, left, right, animations);
            animations.push({
                type: "SORTED",
                payload: [array[mid]],
            });
            quickSort(array, left, mid - 1, animations);
            quickSort(array, mid + 1, right, animations);
        }
        setAnimations([...animations]);
    }



    //function to iterate through the animations array
    //check what the type is if compare add array of the indexes in the state ex. [3,4]
    // conditionall render the color of the if the indexx is in = state compare index
    // if type is swap add array of the indexes in the state ex [3,4]
    // then manipulate the original array swap [3] with [4] // make sure to rewrite bubble to take a copy of the array to not modify it     
    function bubbleSort(array: number[]) {
        const animations = [];
        const sorted = []
        const length = array.length;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < length - i - 1; j++) {
                animations.push({
                    state: State.COMPARE,
                    index1: j,
                    value1: array[j],
                    index2: j + 1,
                    value2: array[j + 1]

                });
                if (array[j] > array[j + 1]) {
                    animations.push({
                        state: State.SWAP,
                        index1: j,
                        value1: array[j],
                        index2: j + 1,
                        value2: array[j + 1]
                    });
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                }
            }

            animations.push({
                state: State.SORTED,
                index1: length - i - 1,
            });
        }
        animations.push({
            state: State.COMPLETE,
        });
        // return animations;
        return setAnimations(animations);
    }

    function insertionSort(numbers: number[]) {
        const animations = [];
        const length = numbers.length;
        animations.push({
            state: State.SORTED,
            index1: 0,
        });
        
        for (let i = 1; i < length; i++) {
            let j = i;
            while (j > 0 && numbers[j - 1] > numbers[j]) {
                animations.push({
                    state: State.COMPARE,
                    index1: j - 1,
                    value1: numbers[j - 1],
                    index2: j,
                    value2: numbers[j]
                });
                animations.push({
                    state: State.SWAP,
                    index1: j - 1,
                    value1: numbers[j - 1],
                    index2: j,
                    value2: numbers[j]
                });
                [numbers[j - 1], numbers[j]] = [numbers[j], numbers[j - 1]];
                j--;
            }
            animations.push({
                state: State.SORTED,
                index1: j,
            });
        }
        animations.push({
            state: State.COMPLETE,
        });
        return setAnimations(animations);
    }

    function StopTimeout() {
        timeouts.forEach(timeout => {
            clearTimeout(timeout);
        })
        setTimeouts([]);
    }
    console.log('position', position);

    function animationIteration(animations: any[]) {
        const length = animations.length;
        const timeouts = [];
        const sorting: number[] = []
        let j: number;
        position === 0 ? j = 0 : j = position;
        console.log('j', j);

        for (let i = j; i < length; i++) {
            timeouts.push(setTimeout(() => {
                setPosition(i);
                setSwap([])
                setCompare([])
                const { state, index1, index2, pivot, payload } = animations[i];
                console.log(state, index1, index2);
                if (state === State.COMPARE) {
                    setCompare([index1, index2]);
                }
                if (state === State.SWAP) {
                    setSwap([index1, index2]);
                    const arrayCopy = array
                    const temp = arrayCopy[index1];
                    arrayCopy[index1] = arrayCopy[index2];
                    arrayCopy[index2] = temp;
                    setArray(arrayCopy);
                    setCompare([]);
                }
                if (state === State.SORTED) {
                    sorting.push(index1);
                    // setSorted(sortedCopy);
                    setCompare([]);
                }
                if (state === State.COMPLETE) {
                    setIsWatching(false);
                    setIsComplete(true);
                }
                // setCompare([]);
            }, i * (250 / speed)));
        }
        if (!isWatching) {
            setSorted(sorting);
            setTimeouts(timeouts);
        }

    }
    // on load sort my copy of array
    // run use effect when the size of my array changes because I need to resort the new array size
    useEffect(() => {
        if (type === SortingAlgorithms.BubbleSort) {
            bubbleSort([...array])
        }
        if (type === SortingAlgorithms.InsertionSort) {
            insertionSort([...array])
        }
        if (type === SortingAlgorithms.MergeSort) {
            mergeSort([...array])
        }
        if (type === SortingAlgorithms.QuickSort) {
            const animations: number[] = []
            quickSort([...array], 0, array.length - 1, animations)
        }



    }, [size, sameSize]);

    return (
        <div className="relative">

            <div className="w-full h-[450px] mx-auto bg-emerald-200 dark:bg-gray-500 flex justify-center transition-colors items-end rounded-lg shadow-lg overflow-hidden">

                {/* map */}
                <div className="text-white py-2 px-2 text-sm absolute flex flex-col rounded-tl-md  xs:rounded-br-md top-8  xs:top-0 left-0 bg-emerald-400 shadow-lg">
                    <div className="flex items-center">
                        <div className="grow">Comparing</div> <div className="ml-3 w-4 h-4 border-2 bg-amber-300 border-amber-400"></div>
                    </div>
                    <div className="flex items-center">
                        <div className="grow">Swapping</div> <div className="ml-3 w-4 h-4 border-2 bg-red-600 border-red-700"></div>
                    </div>
                    <div className="flex items-center">
                        <div className="grow">Sorted</div> <div className="ml-3 w-4 h-4 border-2 bg-lime-600 border-lime-700"></div>
                    </div>

                </div>


                {/* button array controll */}
                {!isRunning && (<div className="absolute flex justify-center  rounded-b-md top-0 shadow-lg bg-emerald-500 overflow-hidden ">
                    {buttons.map(button => (
                        <button
                            key={button}
                            className={classNames("flex justify-center transition-colors  px-5 py-1   w-10  text-sm   text-white bg-emerald-500 hover:bg-emerald-700 dark:bg-gray-500", {
                                "border-emerald-500 dark:border-gray-500": button === size,
                                "bg-emerald-500": size !== button,
                                "bg-emerald-700 hover:bg-emerald-900": size === button,
                            })}
                            onClick={() => handleSizeChange(button)}
                        >
                            {button}
                        </button>
                    ))}
                </div>)}

                {/* button array control end */}
                {/* speed controll */}
                <div className="absolute flex flex-col justify-center  rounded-tr-md top-0 right-0 rounded-bl-md p- shadow-md bg-emerald-500 overflow-hidden ">
                    {speedButtons.map(item => (
                        <button
                            key={item}
                            className={classNames("flex justify-center px-5 py-1 transition-colors w-8 text-sm  text-white bg-emerald-500 hover:bg-emerald-700 dark:bg-gray-500", {
                                "border-emerald-500 dark:border-gray-500": item === speed,
                                "bg-emerald-500": item !== speed,
                                "bg-emerald-700 hover:bg-emerald-900": item === speed,
                            })}
                            onClick={() => handleSpeedChange(item)}
                        >
                            {item}x
                        </button>
                    ))}
                </div>
                {/* speed controll end */}
                {/* array of bar */}
                <div className="flex items-end w-full justify-center">
                    {array.map((value, index) => (

                        <div
                            style={{ height: `${value * 10}px` }}
                            key={index}
                            className={classNames("pb-1 w-4 sm:w-6  border-2 border-b-0 font-semibold text-center   mx-0.5 transition-colors rounded-t-md text-white flex justify-center items-end text-xs ", {
                                // not compare or swap or sorted
                                "bg-slate-700 border-gray-800": !compare.includes(index) && !swap.includes(index) && !sorted.includes(index),
                                " bg-amber-300 border-amber-400 dark:bg-gray-500": index === compare[0] || index === compare[1] || compare.includes(value),
                                "bg-red-600 border-red-700 dark:bg-gray-500": index === swap[0] || index === swap[1],
                                "bg-lime-600 border-lime-700 dark:bg-gray-500": sorted.includes(index),
                                // function that iterates the animations
                                // state taht 
                                // set currentIteration

                                // { state.compare, index1: 0 index2: 1} 
                                // css orange : array in index 1 && index 2 
                                //                           
                            })}

                        >
                            {value}
                        </div>

                    ))}


                </div>

            </div>
            <div className="flex justify-center my-3 ">
                {/* {!isRunning ? (
                    <button className="bg-emerald-500 hover:bg-emerald-700 text-white  font-normal rounded-md px-6 py-1 mx-1" onClick={() => handleStart()}>
                        start
                    </button>

                ) : (
                    <button className="bg-red-500 hover:bg-red-700 text-white  font-normal rounded-md px-6 py-1 mx-1" onClick={() => handleStop()}>
                        stop
                    </button>
                )} */}

                {!isRunning && !isPaused ? (
                    <button className="bg-emerald-500 hover:bg-emerald-700 text-white  font-normal rounded-md px-6 py-1 mx-1" onClick={() => handleStart()}>
                        start
                    </button>
                ) : null}
                {isRunning && !isComplete ? (
                    <button className="bg-red-500 hover:bg-red-700 text-white  font-normal rounded-md px-6 py-1 mx-1" onClick={() => handleStop()}>
                        stop
                    </button>
                ) : null}



                {isPaused && (
                    <button className="bg-emerald-500 hover:bg-emerald-700 text-white  font-normal rounded-md px-6 py-1 mx-1" onClick={() => handleResume()}>
                        resume
                    </button>
                )}

                {isComplete || isRunning ? (
                    <button className="bg-slate-500 hover:bg-slate-700 text-white  font-normal rounded-md px-6 py-1 mx-1" onClick={() => handleReset()}>
                        reset
                    </button>
                ) : null}

            </div>
        </div>

    )
}

export default SortingVisualizer
