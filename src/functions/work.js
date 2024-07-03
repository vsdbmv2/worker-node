import {computeGlobalAlignment, computeLocalAlignment, epitopeMap} from '@vsdbmv2/mapping-library'

export const processWork = (work) => {
  let result;
  if(work.type === 'local-mapping') result = computeLocalAlignment(work.sequence1, work.sequence2);
  if(work.type === 'global-mapping') result = computeGlobalAlignment(work.sequence1, work.sequence2, work.id2)
  if(work.type === 'epitope-mapping') result = epitopeMap(work.sequence1, work.sequence2);
  
  return {
    ...result,
    idSequence: work.id1,
    ...(work.type === 'local-mapping' ? {idSubtype: work.id2} : {})
  };
}

export default processWork;