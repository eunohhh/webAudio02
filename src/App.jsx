import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import Player from './components/player'
import useScript from './utils/useScript';

export const musicUrlArr = [
  {
    num : 0,
    name : "0_soul", 
    url : "/package/assets/music/00_windy soul.mp3"
  },
  {
    num : 1,
    name : "1_human-voice", 
    url : "/package/assets/music/human-voice.mp3"
  },
  {
    num : 2,
    name : "2_bossa", 
    url : "/package/assets/music/02_aoi bossa.mp3"
  },
  {
    num : 3,
    name : "3_espana", 
    url : "/package/assets/music/03_espana.mp3"
  },
  {
    num : 4,
    name : "4_spill", 
    url : "/package/assets/music/04_spill.mp3"
  }
];
export const impulseUrlArr = [
  { 
    num : 0,
    name : "telephone", 
    url : "/package/assets/music/impulse-2/telephone.wav"
  },
  {
    num : 1,
    name : "lowpass", 
    url : "/package/assets/music/impulse-2/lowpass.wav"
  },
  {
    num : 2,
    name : "spring", 
    url : "/package/assets/music/impulse-2/spring.wav"
  },
  {
    num : 3,
    name : "echo", 
    url : "/package/assets/music/impulse-2/echo.wav"
  }
];

function App() {
  const [xyzAudioContext, setXyzAudioContext] = useState(null); // 웹오디오에서 계속 쓰일 오디오 콘텍스트 용 스테이트
  const [audioArr, setAudioArr] = useState([]); // 오디오버퍼 중 음악 트랙들의 버퍼를 담을 스테이트
  const [impulseArr, setImpulseArr] = useState([]); // 오디오버퍼 중 효과 트랙들의 버퍼를 담을 스테이트
  const [suspended, setSuspended] = useState(true); // 최초 사용자 인터랙션 체크용, 시작시 true (중지상태) 클릭시 false(시작) 
  const [fxObj, setFxObj] = useState({});
  const [loading, error] = useScript('/package/js/delElementor.js', 'beforebegin', false);

  const overlayRef = useRef();

  const context = new AudioContext(); // 오디오 콘텍스트 객체 생성!

  // 최초 사용자 인터랙션 체크를 위해 만들어둔 오버레이 클릭 핸들러 함수
  const handleOverlayClick = () => {
    setSuspended(false);
  }

  // suspended 스테이트 상태 변화되면 실행되는 useEffect 여기서 fetch 수행
  useEffect(()=>{ 
    // 프로미스 함수 생성 fetch 가 완료되면 decodeAudioData 반환
    function xyzAudioFetch(context, url, name, num){
      return new Promise((resolve, reject)=>{
        fetch(url)
        .then((response)=>response.arrayBuffer())
        .then((arrayBuffer)=>context.decodeAudioData(arrayBuffer))
        .then((decoded)=>{
          decoded.name = name;
          decoded.num = num;
          resolve(decoded);
        })
        .catch((error)=>{
          console.log(error);
          reject(error);
        });
      })     
    };
    // 만약 상호작용이 시작되어 suspended 가 false 일때 실행
    if(suspended === false){
      
      // 콘텍스트의 상태가 '실행중' 이면 수행
      if(context.state === 'running'){
        
          let arr = []; // 음악 트랙 fetch 결과를 저장할 임시 배열
          let arr2 = []; // 효과 트랙 fetch 결과를 저장할 임시 배열

          // 음악 트랙 데이터 배열을 기준으로 fetch 반복 실행 
          musicUrlArr.forEach((e)=>{
            xyzAudioFetch(context, e.url, e.name, e.num)
            .then((data)=>{
              arr.push(data);
              return arr;
            })
            .then((arr)=>{
              // 원배열과 길이가 같아지면, 즉 모두 받아왔으면 리액트 스테이트 변경
              if(arr.length === musicUrlArr.length) {
                arr.sort(function(a,b){
                  return a.num - b.num;
                })
                // console.log(arr)
                setAudioArr(arr); 
              }
            });
        })

          impulseUrlArr.forEach((e)=>{
            xyzAudioFetch(context, e.url, e.name, e.num)
              .then((data)=>{
                arr2.push(data);
                return arr2
              })
              .then((arr)=>{
                // 원배열과 길이가 같아지면, 즉 모두 받아왔으면 리액트 스테이트 변경
                if(arr.length === impulseUrlArr.length){
                  arr.sort(function(a,b){
                    return a.num - b.num;
                  })
                  setImpulseArr(arr);
                }
              });
          });

          // 사용자 인터랙션이 발생했으니, 콘텍스트를 시작 메소드 실행
          context.resume()
            .then(()=>{
              setXyzAudioContext(context);

              // 1_여기서 객체 생성 합시다~~~~

              // 필요한 프로퍼티들!
              // isPlaying === 재생 중인지 아닌지 판단용
              // currIndex === 현재 재생중인 트랙의 인덱스 저장용
              // startTime === 크로스페이딩 등에 쓰기 위해 트랙의 시작 시간 기록용
              // pauseTime === 일시정지한 시간 기록용
              // offsetTime === 재생 '된' 시간 계산용
              // currSource === 현재 소스 저장용

              // 2_생성하고 나서 스테이트에 저장~~~
              // 3_그리고 그걸 props 로 자식들한테 넘겨주기~~~~~
            });

            const obj = {
              isPlaying : false,
              currIndex : 0,
              startTime : 0,
              pauseTime : 0,
              offsetTime : 0,
              currBuffer: null,
              currSource : null,
              volControlGainNode : null,
              currConvolver : null
            }

            setFxObj(obj);
      }
    }
  },[suspended]);

  console.log(context)

  return (
    <>
      {loading && (
        <div>스크립트로딩중</div>
      )}
      {error && (
        <div>스크립트로딩에러</div>
      )}
      <div 
        className='webapoverlay' 
        ref={overlayRef} 
        style={{display : suspended ? 'block' : 'none'}} 
        onClick={handleOverlayClick}
      >
        <p>click to play</p>
      </div>
      <div className='webapcontainer'>
        <p>screenxyz FX sample</p>
        {suspended === false && (
          <>
            <Player context={context} audioBuffer={audioArr} impulseBuffer={impulseArr} fxObj={fxObj}></Player>
          </>
        )}
      </div>
    </>
  )
}

export default App
