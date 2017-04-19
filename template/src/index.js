import <%moduleName%>Comp from './<%name%>.vue';

<%moduleName%>Comp.install = Vue => {
  Vue.component(<%moduleName%>Comp.name, <%moduleName%>Comp);
};

export default <%moduleName%>Comp;
