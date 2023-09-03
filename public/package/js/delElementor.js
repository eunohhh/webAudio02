"use strict"
// 모든 link 태그 찾아라 
const allLinks = document.querySelectorAll("link"); 
// 그것중에서 id 에 elementor 가 포함된 애들만 필터
const elementorLinks = [...allLinks].filter((e) => {
    return e.id.includes("elementor")
});
// 필터결과로 반복돌려서 지워버려, 근데 없으면 하지마
if(elementorLinks.length === 0){
    console.log('엘리멘터 없음')
}else{
    elementorLinks.forEach(e => e.remove());
    console.log('엘리멘터 삭제 완료')
};