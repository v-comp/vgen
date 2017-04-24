import <%moduleName%>Comp from './<%name%>.vue';

<%moduleName%>Comp.install = Vue => {
  Vue.component(<%moduleName%>Comp.name, <%moduleName%>Comp);
};

if (window.Vue && Vue.use) {
  window.Vue.use(<%moduleName%>Comp);
}

export default <%moduleName%>Comp;
