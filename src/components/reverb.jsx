import { React, useEffect, useState } from 'react'
import '../App.css'

export default function Reverb({context, audioBuffer, impulseBuffer, fxObj, currBuffer}){
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [convolverArr, setConvolverArr] = useState([]);
    const [click, setClick] = useState([]);

    // console.log(fxObj)

    function setReverb(index){
        const value = index;

        if(fxObj.currBuffer !== null && fxObj.currBuffer !== undefined && fxObj.currSource !== null){

            if(click.includes(value)){

                console.log(value)
                setSelectedIndex(null);

                // convolverArr[value].disconnect();

                let copy = [...convolverArr];
                let filter = copy.filter((e) => {
                    if(e.sel === value){
                        e.disconnect();
                    }
                    return e.sel !== value
                });
                setConvolverArr(filter);
            }else{
                // if(convolverObj !== null){
                //     convolverObj.disconnect();
                // }
                const convolver = context.createConvolver();
                convolver.sel = index;
                const impulseResponseBuffer = impulseBuffer[value];

                const wetGainNode = context.createGain();

                convolver.buffer = impulseResponseBuffer;

                convolver.connect(wetGainNode); 
                wetGainNode.connect(context.destination);
                if(index === 0){
                    wetGainNode.gain.value = 20;
                }else{
                    wetGainNode.gain.value = 1.5;
                }
                
                fxObj.currSource.connect(convolver);
                
                // console.log(convolver);
                // console.log(wetGainNode);
                // console.log(context);

                let copy = [...convolverArr];
                copy.push(convolver);
                setConvolverArr(copy);

                setSelectedIndex(value);
                fxObj.currConvolver = convolver;
            }
        }
    };

    const handleClick = (e) => {
        const index = Number(e.target.getAttribute('value'))
        setReverb(index)

        let copy = [...click]
        if(copy.includes(index)){
            let filter = copy.filter(e => e !== index)
            setClick(filter)
            // console.log(filter)
        }else{
            copy.push(index)
            setClick(copy)
            // console.log(copy)
        }
    };

    useEffect(()=>{
        // console.log(fxObj)
        // console.log(convolverArr)
            if(convolverArr.length > 0){
                convolverArr.forEach((e)=> fxObj.currSource.connect(e));
            }
        
    },[convolverArr, fxObj.currBuffer, fxObj.currSource, fxObj.isPlaying])

    return (
        <div className='webapbox'>
            <p style={{fontSize: '1.2rem'}}>reverb</p>
            <div className='webapreverbbox'>
                <div className= 'webaptel' style={{cursor : 'pointer'}}>
                    <div value={0} onClick={handleClick} className={click.includes(0) ? 'reverbclick' : 'reverb'}></div>
                    <p>Telephone</p>
                </div>
                <div className='webaptel' style={{cursor : 'pointer'}}>
                    <div value={1} onClick={handleClick} className={click.includes(1) ? 'reverbclick' : 'reverb'}></div>
                    <p>lowpass</p>
                </div>
                <div className= 'webaptel' style={{cursor : 'pointer'}}>
                    <div value={2} onClick={handleClick} className={click.includes(2) ? 'reverbclick' : 'reverb'}></div>
                    <p>Spring</p>
                </div>
                <div className= 'webaptel' style={{cursor : 'pointer'}}>
                    <div value={3} onClick={handleClick} className={click.includes(3) ? 'reverbclick' : 'reverb'}></div>
                    <p>Echo</p>
                </div>
            </div>
        </div>
    )
}