import { createDockController } from './dockController';
import { createBubbleController } from './bubbleController';
import { createVideoController } from './videoController';
import { observeHeadings } from './headingController';
import { getGsap } from '@/lib/gsap';
export function mountFloatingAvatar(root:HTMLElement,panel:HTMLElement,signal:AbortSignal,onLead:(task?:string)=>void){
  const handle=root.querySelector<HTMLButtonElement>('.avatar-handle')!;
  const media=createVideoController(root,signal);
  let bubble:ReturnType<typeof createBubbleController>|null=null,destroyed=false;
  let reactionTimer:ReturnType<typeof setTimeout>|undefined;
  function pulse(reason:string){
    clearTimeout(reactionTimer);root.dataset.reaction=reason;
    reactionTimer=setTimeout(()=>delete root.dataset.reaction,1000);
  }
  const dock=createDockController(root,handle,{
    layout(){bubble?.layout();},
    interaction(state){bubble?.update();if(state==='dragging')media.rest();else if(state==='idle')media.resume();},
    click(){bubble?.toggle();},
  });
  bubble=createBubbleController(root,panel,dock,visible=>{if(visible)pulse('heading');},onLead);
  const stopHeadings=observeHeadings(root,context=>bubble?.setSection(context));
  function click(event:MouseEvent){
    if(root.inert||document.hidden||(dock.moving||(dock.suppressingClick&&event.detail>0))||!(event.target instanceof Element))return;
    pulse('click');media.glint();
  }
  // Capture before app handlers: preserve the link/button action and never preventDefault.
  document.addEventListener('click',click,true);
  void getGsap().then(runtime=>{if(!destroyed&&!signal.aborted){dock.setAnimator(runtime.gsap);bubble?.setAnimator(runtime.gsap);}}).catch(()=>{});
  function overlay(){
    const blocked=document.body.dataset.modalOpen==='true'||document.body.dataset.navigationOpen==='true'||document.hidden;
    root.inert=blocked;bubble?.block(blocked);media.block(blocked);if(blocked)dock.cancel();
  }
  const observer=new MutationObserver(overlay);observer.observe(document.body,{attributes:true,attributeFilter:['data-modal-open','data-navigation-open']});
  document.addEventListener('visibilitychange',overlay);overlay();
  return ()=>{destroyed=true;stopHeadings();clearTimeout(reactionTimer);document.removeEventListener('click',click,true);observer.disconnect();document.removeEventListener('visibilitychange',overlay);bubble?.destroy();dock.destroy();media.destroy();};
}
