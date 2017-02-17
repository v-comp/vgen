<template>
  <h1 :class="styles.heading">{{text}}</h1>
</template>

<script>
  import classNames from 'classnames';
  import styles from './<%name%>.css';

  export default {
    name: '<%name%>',
    props: {
      text: String
    },
    data() {
      return {
        styles: {
          heading: classNames(styles['heading'], styles['heading-primary'])
        }
      };
    }
  };
</script>
