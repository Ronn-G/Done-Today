export default {
  heading:{
    eyebrow:'Personalize your experience',
    title:'Settings',
    subtitle:'Manage your language, work categories, backups, and appearance.',
  },
  about:{version:'Version'},
  language:{label:'Language',description:'Choose the language used by the app.',option:{vi:'Tiếng Việt',en:'English'},status:{saving:'Saving…',saved:'Saved',error:'We couldn’t save the language. Try again.'}},
  categories:{
    heading:{title:'Work categories',description:'Create and arrange the categories shown in the Today table.'},
    create:{
      nameLabel:'New category name',namePlaceholder:'New category name',colorLabel:'New category color',
      hexLabel:'New category HEX code',action:'Create category',
    },
    status:{loading:'Loading categories…',active:'Visible',inactive:'Hidden'},
    item:{
      rowLabel:'Category {{name}}',nameLabel:'Category name: {{name}}',colorLabel:'Category color: {{name}}',
      moveUp:'Move {{name}} up',moveDown:'Move {{name}} down',
      hide:'Hide category {{name}}',show:'Show category {{name}}',
    },
    accessibility:{list:'Work category list'},
    validation:{
      nameRequired:'Enter a category name.',
      nameMax:'Category names can be up to 100 characters.',
      colorHex:'Use a HEX color in the format #RRGGBB.',
    },
    errors:{
      load:'Couldn’t load work categories.',
      invalid:'The category name or color is invalid.',
      update:'Couldn’t update the work category.',
      reorder:'Couldn’t change the category order.',
    },
    backendErrors:{
      nameInvalid:'Category names must contain {{min}}–{{max}} characters.',
      colorInvalid:'Enter a valid hexadecimal category color.',
      reorderInvalid:'The category order is invalid. Refresh and try again.',
    },
  },
} as const;
