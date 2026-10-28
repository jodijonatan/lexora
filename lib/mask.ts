export function mask(value:string, visible=3){if(!value)return '';if(value.length<=visible)return '█'.repeat(value.length);return '█'.repeat(value.length-visible)+value.slice(-visible)}
