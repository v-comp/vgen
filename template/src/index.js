import <%moduleName%>Component from './<%name%>.vue';

<%moduleName%>Component.install =  Vue => {
  Vue.component(<%moduleName%>Component.name, <%moduleName%>Component );
};

export default <%moduleName%>Component;
