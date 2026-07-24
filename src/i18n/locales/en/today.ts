export default {
  foundation:{ready:'Ready'},
  eyebrow:{today:'Today',archive:'Daily journal'},
  heading:{prompt:'What did you get done today?'},
  subtitle:{
    today:'Capture an ordinary day — that’s how progress takes shape.',
    past:'You can view and edit past days in the same table.',
  },
  dateControls:{previous:'Previous day',next:'Next day',choose:'Choose date',today:'Today'},
  stats:{label:'Daily statistics',total:'Total tasks',completed:'Completed',completionRate:'Completion rate'},
  fields:{
    task:{label:'Work done',placeholder:'What did you work on?'},
    result:{label:'Result',placeholder:'What was the result?'},
    nextAction:{label:'Next step',placeholder:'What needs to happen next?'},
    status:{label:'Status'},
  },
  status:{
    loading:'Loading journal…',
    options:{completed:'Completed',inProgress:'In progress',postponed:'Postponed',cancelled:'Cancelled'},
  },
  table:{
    label:'Daily work table',
    columns:{order:'Order',task:'Work done',result:'Result',nextAction:'Next step',status:'Status',actions:'Actions'},
  },
  categories:{
    other:'Other',
    hidden:'Hidden',
    completedCount_one:'{{completed}} of {{count}} task completed',
    completedCount_other:'{{completed}} of {{count}} tasks completed',
    addItem:'Add a task to {{category}}',
    moveTo:'Move to category',
    expand:'Expand {{category}}',
    collapse:'Collapse {{category}}',
  },
  item:{
    untitled:'untitled',
    delete:'Delete task',
    accessibility:{actionsForTask:'Actions for task {{task}}'},
    confirmDelete:{
      title:'Delete this task?',
      body:'The content you entered can’t be recovered.',
      confirm:'Delete task',
    },
    errors:{
      delete:'We couldn’t delete the task. Try again.',
      move:'We couldn’t move the task. Try again.',
      reorder:'We couldn’t change the task order. Try again.',
    },
  },
  emptyState:{title:'No tasks yet.',body:'Choose a category below to start recording your day.'},
  addItem:{label:'Add row to',chooseCategory:'Choose a category…',accessibility:{chooseCategory:'Choose a category for the new row'}},
  autosave:{hint:'Ctrl + Enter to add a row · Changes save automatically'},
} as const;
