import {computeGlobalAlignment, computeLocalAlignment, epitopeMap} from '@vsdbmv2/mapping-library';

const processWork = (work) => {
  let result;
  if(work.type === 'local-mapping') result = computeLocalAlignment(work.sequence1, work.sequence2);
  if(work.type === 'global-mapping') result = computeGlobalAlignment(work.sequence1, work.sequence2, work.id2)
  if(work.type === 'epitope-mapping') result = epitopeMap(work.sequence1, work.sequence2);
  
  return {
    ...result,
    idSequence: work.id1,
    organism: work.organism,
    ...(work.type === 'local-mapping' ? {idSubtype: work.id2} : {})
  };
}

process.on('message', (work) => {
  try {
    const payload = processWork(work);
    process?.send?.({
      payload,
      type: work.type,
      identifier: work.identifier,
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});