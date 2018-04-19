<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      This is a <a
        href="https://vuejs.org"
        target="_blank">Vue</a>
      app, intended to (eventually) showcase Vue integration with
      <a
        href="http://oddbird.net/herman/"
        target="_blank">Herman</a>
      automated style guides.
    </p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  group: 'vue-components',
  access: 'public',
  description: 'A message to the world.',
  deprecated: 'This is being replaced by …',
  reusable: true,
  links: {
    'Link description': 'http://www.google.com/',
    'Another link': 'http://www.odbird.net/',
  },
  see: {
    vue: 'another-component',
    sass: 'related-mixin',
  },
  since: {
    '0.1.2': '0.1.2 changelog message',
    '1.0.1': '1.0.1 changelog message',
  },
  todo: ['Todo item', 'Another todo item'],
  props: {
    msg: {
      type: String,
      default: '',
      description: 'Document the purpose of this property directly inline…',
    },
  },
  events: {
    close: {
      description: 'The user has pressed the close button.',
      arguments: null,
    },
    resize: {
      description: 'The user has initiated click-and-drag resizing.',
      arguments: [
        {
          name: 'dimensions',
          description: 'The new dimensions of the modal.',
          type: Object,
          shape: {
            width: Number,
          },
        },
      ],
    },
  },
  slots: {
    default: {
      description: 'The main content of the modal.',
      required: true,
    },
    header: {
      description:
        'The header displayed at the top of the modal. ' +
        'Its content is visually separated by the main content by a darker ' +
        'background color.',
    },
  },
};
</script>

<!-- In case we need longer descriptions… -->
<description>
  ## Allow Markdown Description Here

  Or is it reasonable to include markdown
  in the component script,
  using template literals?
</description>

<example description="Render this component with the default prop values…">
  <HelloWorld />
</example>

<example description="Pass in a value!">
  <HelloWorld msg="This is a message." />
</example>
