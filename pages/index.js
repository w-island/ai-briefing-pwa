import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
const BLUE = "#2563EB";
const WHITE = "#FFFFFF";
const categoryEmoji = {
  "커머스·커머스AI":"🛒","생성AI·LLM":"🤖","마케팅·광고AI":"📢",
  "산업·비즈니스":"🏢","정책·규제":"⚖️","툴·자동화":"⚙️",
};
const impactConfig = {
  high:{label:"🔥 주목",bg:"#FEF2F2",border:"#FCA5A5",text:"#DC2626"},
  medium:{label:"👀 참고",bg:"#FFFBEB",border:"#FCD34D",text:"#D97706"},
  low:{label:"📌 동향",bg:"#F0FDF4",border:"#86EFAC",text:"#16A34A"},
};
function formatDate(){return new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"});}
function KakaoCard({item,index}){
  const [open,setOpen]=useState(false);
  const imp=impactConfig[item.impact]||impactConfig.low;
  const emoji=categoryEmoji[item.category]||"📰";
  const lines=(item.summary||"").split("\n").map(l=>l.trim()).filter(l=>/^\d\./.test(l));
  return(
    <div style={{animation:`slideUp 0.4s ease ${index*0.08}s both`,marginBottom:16}}>
      <div style={{display:"flex",gap:8}}>
        <div style={{width:36,height:36,borderRadius:12,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,marginTop:2}}>{emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:700,color:"#374151"}}>AI 브리핑</span>
            <span style={{fontSize:11,color:"#6B7280"}}>{item.category}</span>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20,background:imp.bg,color:imp.text,border:`1px solid ${imp.border}`}}>{imp.label}</span>
          </div>
          <div onClick={()=>setOpen(!open)} style={{background:WHITE,borderRadius:"0 14px 14px 14px",padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",cursor:"pointer",border:item.impact==="high"?"1.5px solid #FCA5A5":"1.5px solid transparent"}}>
            <p style={{fontSize:14,fontWeight:800,color:"#111827",margin:"0 0 10px",lineHeight:1.4}}>{item.title}</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {lines.map((line,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{minWidth:20,height:20,borderRadius:"50%",background:BLUE,color:WHITE,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</span>
                  <p style={{fontSize:13,color:"#374151",margin:0,lineHeight:1.65}}>{line.replace(/^\d\.\s*/,"")}</p>
                </div>
              ))}
              {open&&(
                <div style={{marginTop:8,padding:"10px 12px",background:"#EFF6FF",borderRadius:10,borderLeft:`3px solid ${BLUE}`,animation:"slideUp 0.2s ease both"}}>
                  <p style={{fontSize:12.5,color:"#1E40AF",margin:0,lineHeight:1.65}}>{item.insight}</p>
                </div>
              )}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,alignItems:"center"}}>
              <span style={{fontSize:11,color:"#9CA3AF"}}>{item.source}</span>
              <span style={{fontSize:11,color:BLUE,fontWeight:600}}>{open?"접기 ↑":"활용방안 보기 →"}</span>
            </div>
          </div>
          <p style={{fontSize:11,color:"#9CA3AF",margin:"4px 0 0 4px"}}>{new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}</p>
        </div>
      </div>
    </div>
  );
}
function SkeletonBubble(){
  return(
    <div style={{display:"flex",gap:8,marginBottom:16,animation:"pulse 1.2s ease infinite"}}>
      <div style={{width:36,height:36,borderRadius:12,background:"#E5E7EB",flexShrink:0}}/>
      <div style={{flex:1}}>
        <div style={{height:14,width:80,borderRadius:4,background:"#E5E7EB",marginBottom:8}}/>
        <div style={{background:WHITE,borderRadius:"0 14px 14px 14px",padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <div style={{height:15,width:"70%",borderRadius:4,background:"#E5E7EB",marginBottom:12}}/>
          {[90,100,80].map((w,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"#E5E7EB",flexShrink:0}}/>
              <div style={{height:13,width:`${w}%`,borderRadius:4,background:"#F3F4F6"}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default function Home(){
  const [news,setNews]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [filter,setFilter]=useState("전체");
  const [dots,setDots]=useState(".");
  const [lastTime,setLastTime]=useState(null);
  useEffect(()=>{
    if(!loading)return;
    const iv=setInterval(()=>setDots(d=>d.length>=3?".":d+"."),500);
    return()=>clearInterval(iv);
  },[loading]);
  const fetchNews=useCallback(async()=>{
    setLoading(true);setError(null);setNews([]);
    try{
      const res=await fetch("/api/news",{method:"POST"});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Unknown error");
      if(!Array.isArray(data.news)||!data.news.length)throw new Error("뉴스 데이터가 비어있습니다");
      setNews(data.news);setLastTime(new Date());
    }catch(e){setError(`오류: ${e.message}`);}
    finally{setLoading(false);}
  },[]);
  const categories=["전체",...Object.keys(categoryEmoji)];
  const filtered=filter==="전체"?news:news.filter(n=>n.category===filter);
  const highCount=news.filter(n=>n.impact==="high").length;
  return(
    <>
      <Head>
        <title>AI 데일리 브리핑 · W Island</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
      </Head>
      <div style={{minHeight:"100vh",background:"#F0F4FF"}}>
        <div style={{background:WHITE,borderBottom:"1px solid #E5E7EB",padding:"16px 20px 12px",position:"sticky",top:0,zIndex:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:12,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
              <div>
                <p style={{fontSize:15,fontWeight:800,color:"#111827",margin:0}}>AI 데일리 브리핑</p>
                <p style={{fontSize:11,color:"#6B7280",margin:0}}>W Island · {formatDate()}</p>
              </div>
            </div>
            <button onClick={fetchNews} disabled={loading} style={{background:loading?"#E5E7EB":BLUE,color:loading?"#9CA3AF":WHITE,border:"none",borderRadius:10,padding:"8px 14px",fontSize:12.5,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6}}>
              {loading?(<><span style={{width:12,height:12,display:"inline-block",border:"2px solid #ccc",borderTop:`2px solid ${BLUE}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>분석 중</>):"↻ 새로고침"}
            </button>
          </div>
          {news.length>0&&(
            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
              {[{label:`총 ${news.length}건`,bg:"#EFF6FF",text:BLUE},{label:`🔥 주목 ${highCount}건`,bg:"#FEF2F2",text:"#DC2626"},lastTime&&{label:lastTime.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})+" 업데이트",bg:"#F0FDF4",text:"#16A34A"}].filter(Boolean).map((p,i)=>(
                <span key={i} style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:p.bg,color:p.text}}>{p.label}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{padding:"0 16px 120px"}}>
          {!loading&&news.length===0&&!error&&(
            <div style={{paddingTop:48,textAlign:"center"}}>
              <div style={{width:180,margin:"0 auto 28px",background:"#1F2937",borderRadius:28,padding:"12px 10px",boxShadow:"0 20px 60px rgba(0,0,0,0.18)"}}>
                <div style={{background:"#111827",borderRadius:20,padding:"14px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,borderBottom:"1px solid #374151",paddingBottom:8}}>
                    <div style={{width:22,height:22,background:BLUE,borderRadius:6,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>🤖</div>
                    <span style={{fontSize:10,fontWeight:800,color:WHITE}}>AI 브리핑</span>
                    <span style={{fontSize:9,color:"#6B7280",marginLeft:"auto"}}>오전 6:00</span>
                  </div>
                  {[{t:"오늘의 브리핑이 도착했습니다.",w:"90%"},{t:"커머스AI 트렌드 3건",w:"80%"},{t:"활용방안까지 한번에 →",w:"95%",blue:true}].map((b,i)=>(
                    <div key={i} style={{background:b.blue?BLUE:"#374151",borderRadius:"10px 10px 10px 0",padding:"7px 9px",marginBottom:5,fontSize:9,color:WHITE,fontWeight:b.blue?700:400,width:b.w}}>{b.t}</div>
                  ))}
                </div>
              </div>
              <p style={{fontSize:17,fontWeight:800,color:"#111827",margin:"0 0 8px",lineHeight:1.5}}>매일 쏟아지는 AI 소식,<br/>찾아보기 힘드시죠?</p>
              <p style={{fontSize:13,color:"#6B7280",margin:"0 0 24px",lineHeight:1.7}}>커머스·마케팅 관점으로 정리된<br/>오늘의 핵심 뉴스 + 실무 시사점</p>
              <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:320,margin:"0 auto 28px"}}>
                {[["긴 유튜브 영상 안 봄","카드 5줄, 읽기 2분"],["뭘 봐야 할지 모름","활용팁까지 한번에"],["비싼 AI강의 결제만 함","하루 1분이면 충분"]].map(([b,a],i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{flex:1,fontSize:12,padding:"7px 12px",borderRadius:20,background:"#F3F4F6",color:"#9CA3AF",textDecoration:"line-through",textAlign:"center"}}>{b}</span>
                    <span style={{fontSize:14,color:"#9CA3AF"}}>→</span>
                    <span style={{flex:1,fontSize:12,padding:"7px 12px",borderRadius:20,background:"#EFF6FF",color:BLUE,fontWeight:700,textAlign:"center"}}>{a}</span>
                  </div>
                ))}
              </div>
              <button onClick={fetchNews} style={{background:BLUE,color:WHITE,border:"none",borderRadius:14,padding:"16px 0",fontSize:16,fontWeight:800,cursor:"pointer",width:"100%",maxWidth:320,boxShadow:`0 8px 24px ${BLUE}40`,display:"block",margin:"0 auto"}}>오늘의 브리핑 받기 →</button>
              <p style={{fontSize:11,color:"#9CA3AF",marginTop:10}}>✅ 읽기 2분 &nbsp;·&nbsp; ⏱ 시간 대비 효율 최고</p>
            </div>
          )}
          {error&&(
            <div style={{margin:"20px 0",padding:"14px 16px",background:"#FEF2F2",borderRadius:12,border:"1px solid #FCA5A5"}}>
              <p style={{fontSize:13,color:"#DC2626",margin:0}}>{error}</p>
              <button onClick={fetchNews} style={{marginTop:10,fontSize:13,color:BLUE,background:"none",border:"none",cursor:"pointer",fontWeight:700}}>다시 시도 →</button>
            </div>
          )}
          {loading&&(
            <div style={{paddingTop:12}}>
              <div style={{textAlign:"center",padding:16,background:WHITE,borderRadius:14,margin:"12px 0",border:"1px solid #E5E7EB"}}>
                <p style={{fontSize:13,color:"#6B7280",margin:"0 0 2px"}}>오늘의 AI 이슈 수집 중{dots}</p>
                <p style={{fontSize:11,color:"#9CA3AF",margin:0}}>웹 검색 → 요약 → 시사점 분석</p>
              </div>
              {[1,2,3].map(i=><SkeletonBubble key={i}/>)}
            </div>
          )}
          {news.length>0&&!loading&&(
            <div style={{display:"flex",gap:6,overflowX:"auto",padding:"14px 0 10px"}}>
              {categories.map(cat=>(
                <button key={cat} onClick={()=>setFilter(cat)} style={{whiteSpace:"nowrap",padding:"6px 14px",borderRadius:20,border:filter===cat?"none":"1px solid #E5E7EB",fontSize:12,fontWeight:600,cursor:"pointer",background:filter===cat?BLUE:WHITE,color:filter===cat?WHITE:"#374151",transition:"all 0.15s"}}>
                  {cat==="전체"?`전체 ${news.length}`:`${categoryEmoji[cat]} ${cat.split("·")[0]}`}
                </button>
              ))}
            </div>
          )}
          {!loading&&filtered.map((item,i)=><KakaoCard key={item.id||i} item={item} index={i}/>)}
          {news.length>0&&!loading&&(
            <div style={{textAlign:"center",padding:"20px 0 10px",borderTop:"1px solid #E5E7EB",marginTop:8}}>
              <p style={{fontSize:11,color:"#9CA3AF",margin:"0 0 4px"}}>카드를 탭하면 활용방안을 확인할 수 있습니다</p>
              <p style={{fontSize:11,color:"#D1D5DB",margin:0}}>W Island AI 브리핑 · powered by Claude</p>
            </div>
          )}
        </div>
        {news.length===0&&!loading&&(
          <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#111827",padding:"14px 20px"}}>
            <button onClick={fetchNews} style={{background:BLUE,color:WHITE,border:"none",borderRadius:12,padding:"14px 0",fontSize:15,fontWeight:800,cursor:"pointer",width:"100%"}}>지금 바로 시작하기</button>
          </div>
        )}
      </div>
    </>
  );
}
