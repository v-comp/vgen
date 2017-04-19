import <%moduleName%>Comp from './index';
window.Vue.use(<%moduleName%>Comp);

// logic of your demo here...
new window.Vue({
  el: '#app',
  template: '<<%name%> :text="text"></<%name%>>',
  data() {
    return {
      text: 'Hello World'
    };
  }
});
