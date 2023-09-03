import { React, useEffect, useState } from 'react'
import '../App.css'

export default function Reverb({context, audioBuffer, impulseBuffer, fxObj, currBuffer}){
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [convolverObj, setConvolverObj] = useState(null);
    const [click, setClick] = useState([]);

    // console.log(fxObj)

    function setReverb(index){
        const value = index;

        if(fxObj.currBuffer !== null && fxObj.currBuffer !== undefined && fxObj.currSource !== null){

            if(selectedIndex === value){
                setSelectedIndex(null);
                convolverObj.disconnect();
            }else{
                if(fxObj.currConvolver !== null){
                    convolverObj.disconnect();
                }
                const convolver = context.createConvolver();
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

                setConvolverObj(convolver);
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
            console.log(filter)
        }else{
            copy.push(index)
            setClick(copy)
            console.log(copy)
        }
    };

    useEffect(()=>{
        // console.log(fxObj)
        if(fxObj.currSource !== null && fxObj.currSource !== undefined){
            if(convolverObj !== null){
                fxObj.currSource.connect(convolverObj)
            }
        }
    },[fxObj.currBuffer, fxObj.currSource, fxObj.isPlaying])

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