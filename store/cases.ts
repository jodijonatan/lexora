'use client';
import {create} from 'zustand';import {persist,createJSONStorage} from 'zustand/middleware';
export type CaseRecord={id:string;pin:string;typeId:string;typeName:string;occurredAt:string;narrative:string;platform:string;amount:number;urgency:string;status:string;completeness:number;contact:string;createdAt:string;timeline:{at:string;text:string;actor:string}[];channelReports:{channelId:string;status:string;refNumber?:string}[];evidence:{name:string;sizeKB:number;sha256?:string;dataUrl?:string;category?:string}[];messages:{text:string;from:string;at:string}[]};
type State={cases:CaseRecord[];addCase:(c:CaseRecord)=>void;updateCase:(id:string,patch:Partial<CaseRecord>)=>void;addTimeline:(id:string,text:string,actor?:string)=>void;reset:()=>void};
const seed: CaseRecord[] = [];
export const useCases = create<State>()(
  persist(
    (set) => ({
      cases: seed,
      addCase: (c) => set((s) => ({ cases: [c, ...s.cases] })),
      updateCase: (id, patch) =>
        set((s) => ({
          cases: s.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      addTimeline: (id, text, actor = 'KORBAN') =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === id
              ? {
                  ...c,
                  timeline: [...c.timeline, { at: new Date().toISOString(), text, actor }],
                }
              : c
          ),
        })),
      reset: () => set({ cases: [] }),
    }),
    { name: 'lexora-cases', storage: createJSONStorage(() => localStorage) }
  )
);
