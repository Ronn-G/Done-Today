export default {
  foundation:{ready:'Ready'},
  customizer:{open:'Customize appearance'},
  mode:{
    heading:'Display mode',
    description:'Choose a light or dark palette, or follow your system setting.',
    optionsLabel:'Choose a display mode',
    light:'Light',
    dark:'Dark',
    system:'System',
  },
  preset:{
    heading:'Preset themes',
    description:'Choose a color foundation, then fine-tune it if you like.',
    optionsLabel:'Choose a preset theme',
    doneToday:{name:'Done Today',description:'Warm green tones with a calm, balanced feel.'},
    forest:{name:'Forest',description:'Deep forest greens on a soft cream background.'},
    ocean:{name:'Ocean',description:'Cool navy and ocean tones on a bright background.'},
    lavender:{name:'Lavender',description:'Soft violet tones with an airy, gentle feel.'},
    warmSand:{name:'Warm Sand',description:'Warm sand and brown tones with a quiet feel.'},
    monochrome:{name:'Monochrome',description:'A restrained grayscale palette with crisp contrast.'},
  },
} as const;
