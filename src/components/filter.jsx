import { React, useState, useEffect } from 'react'
import '../App.css'

export default function Filter({context, audioBuffer, fxObj, currBuffer}){

    const [filterSet, setFilterSet] = useState(null); 
    const [checked, setChecked] = useState(false);
    const [valueF, setValueF] = useState(1);
    const [valueQ, setValueQ] = useState(0);

    const handleCheckChange = (e) => {
        setChecked(!checked);
        // Check if we want to enable the filter.
        if (e.currentTarget.checked) {

            if(fxObj.isPlaying){
                const filter = context.createBiquadFilter();
            
                // Connect through the filter.
                fxObj.currSource.connect(filter);
                
                filter.connect(fxObj.volControlGainNode);

                // console.log(filter)
                // filter.type = filter.LOWPASS;
                filter.frequency.value = 5000;
                filter.gain.value = 1;
                filter.Q.value = 0.5;

                setFilterSet(filter);
            }    
        } else {
            if(filterSet){
                filterSet.disconnect(0);
            }
        }
    };

    const handleChangeF = (e) => {
        setValueF(e.currentTarget.value);
        if(filterSet !== null){ // 클릭시 현재버퍼가 있으면

            // Clamp the frequency between the minimum value (40 Hz) and half of the
            // sampling rate.
            const minValue = 40;
            const maxValue = context.sampleRate / 2;
            // Logarithm (base 2) to compute how many octaves fall in the range.
            const numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
            // Compute a multiplier from 0 to 1 based on an exponential scale.
            let multiplier = Math.pow(2, numberOfOctaves * (e.currentTarget.value - 1.0));

            // Get back to the frequency value between min and max.
            filterSet.frequency.value = maxValue * multiplier; 
        }
    };

    const handleChangeQ = (e) => {
        setValueQ(e.currentTarget.value);
        if(filterSet){
            const qualityMultify = 30;
            filterSet.Q.value = e.currentTarget.value * qualityMultify;
        }  
    };

    //추가할것 : enable 체크 된 상태면 곡이 바뀌어도 바뀐 곡에 자동 필터 적용할 것 
    useEffect(()=>{
        // console.log(fxObj)
        if(fxObj.currSource !== null && fxObj.currSource !== undefined){
            if(filterSet !== null){
                fxObj.currSource.connect(filterSet)
            }
        }
    },[fxObj.currBuffer])

    return (
        <div className='webapbox'>
            <p style={{fontSize: '1.2rem'}}>filter</p>
            <div className='webapfilter'>
                <input 
                    type="checkbox" 
                    id="c1" 
                    checked={checked}
                    onChange={handleCheckChange}
                ></input>
                <label htmlFor="c1"><span>Enable filter</span></label>
            </div>

            <div className='webapfilterbtn'>
                <input
                    type='range'
                    min={0}
                    max={1}
                    step={0.02}
                    value={valueF}
                    onChange={handleChangeF}
                />
                <span>Frequency</span>
            </div>
            <div className='webapfilterbtn'>
                <input
                    type='range'
                    min={0.5}
                    max={1.5}
                    step={0.02}
                    value={valueQ}
                    onChange={handleChangeQ}
                />
                <span>Q</span>
            </div>
        </div>
    )
}