import <%moduleName%>Component from './index';
window.Vue.use(<%moduleName%>Component);

// logic of your demo here...
let vm = new Vue({
  el: '#app',
  template: '<<%name%> :text="text"></<%name%>>',
  data() {
    return {
      text: 'Hello World'
    };
  },
});
