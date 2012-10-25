/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var App = require('app');

App.InstallerStep7View = Em.View.extend({

  templateName: require('templates/installer/step7'),

  didInsertElement: function () {
    var controller = this.get('controller');
    controller.loadStep();
  }

});

App.ServiceConfigsByCategoryView = Ember.View.extend({
  viewName: 'serviceConfigs',
  content: null,

  category: null,
  serviceConfigs: null, // General, Advanced, NameNode, SNameNode, DataNode, etc.

  categoryConfigs: function () {
    return this.get('serviceConfigs').filterProperty('category', this.get('category.name'))
  }.property('serviceConfigs.@each').cacheable()
});

App.ServiceConfigTab = Ember.View.extend({

  tagName: 'li',

  selectService: function (event) {
    this.set('controller.selectedService', event.context);
  },

  didInsertElement: function () {
    var serviceName = this.get('controller.selectedService.serviceName');
    this.$('a[href="#' + serviceName + '"]').tab('show');
  }
});

App.ServiceConfigPopoverSupport = Ember.Mixin.create({
  didInsertElement: function () {
    if (this.get('isPopoverEnabled') !== 'false') {
      this.$().popover({
        title: this.get('serviceConfig.displayName') + '<br><small>' + this.get('serviceConfig.name') + '</small>',
        content: this.get('serviceConfig.description'),
        placement: 'right',
        trigger: 'hover'
      });
    }
  }
});

App.ServiceConfigTextField = Ember.TextField.extend(App.ServiceConfigPopoverSupport, {

  serviceConfig: null,
  isPopoverEnabled: true,
  valueBinding: 'serviceConfig.value',
  classNameBindings: 'textFieldClassName',

  textFieldClassName: function () {
    // sets the width of the field depending on display type
    if (['directory', 'url', 'email', 'user', 'host'].contains(this.get('serviceConfig.displayType'))) {
      return ['span6'];
    } else {
      return ['input-small'];
    }
  }.property('serviceConfig.displayType'),

  disabled: function () {
    return !this.get('serviceConfig.isEditable');
  }.property('serviceConfig.isEditable')

});

App.ServiceConfigTextFieldWithUnit = Ember.View.extend(App.ServiceConfigPopoverSupport, {
  serviceConfig: null,
  valueBinding: 'serviceConfig.value',
  classNames: [ 'input-append' ],

  template: Ember.Handlebars.compile('{{view App.ServiceConfigTextField serviceConfigBinding="view.serviceConfig" isPopoverEnabled="false"}}<span class="add-on">{{view.serviceConfig.unit}}</span>'),

  disabled: function () {
    return !this.get('serviceConfig.isEditable');
  }.property('serviceConfig.isEditable')

});

App.ServiceConfigPasswordField = Ember.TextField.extend({
  serviceConfig: null,
  type: 'password',
  valueBinding: 'serviceConfig.value',
  classNames: [ 'span3' ],
  placeholder: 'Type password',

  template: Ember.Handlebars.compile('{{view view.retypePasswordView placeholder="Retype password"}}'),

  retypePasswordView: Ember.TextField.extend({
    type: 'password',
    classNames: [ 'span3', 'retyped-password' ],
    valueBinding: 'parentView.serviceConfig.retypedPassword'
  })

});

App.ServiceConfigTextArea = Ember.TextArea.extend(App.ServiceConfigPopoverSupport, {

  serviceConfig: null,
  valueBinding: 'serviceConfig.value',
  rows: 4,
  classNames: ['span6'],

  disabled: function () {
    return !this.get('serviceConfig.isEditable');
  }.property('serviceConfig.isEditable')

});

App.ServiceConfigBigTextArea = App.ServiceConfigTextArea.extend({
  rows: 10
});

App.ServiceConfigCheckbox = Ember.Checkbox.extend(App.ServiceConfigPopoverSupport, {

  serviceConfig: null,
  checkedBinding: 'serviceConfig.value',

  disabled: function () {
    return !this.get('serviceConfig.isEditable');
  }.property('serviceConfig.isEditable')

});

App.ServiceConfigHostPopoverSupport = Ember.Mixin.create({
  didInsertElement: function () {
    this.$().popover({
      title: this.get('serviceConfig.displayName'),
      content: this.get('serviceConfig.description'),
      placement: 'right',
      trigger: 'hover'
    });
  }
});

App.ServiceConfigMasterHostView = Ember.View.extend(App.ServiceConfigHostPopoverSupport, {

  serviceConfig: null,
  classNames: ['master-host', 'span6'],
  valueBinding: 'serviceConfig.value',

  template: Ember.Handlebars.compile('{{value}}')

});

App.ServiceConfigMultipleHostsDisplay = Ember.Mixin.create(App.ServiceConfigHostPopoverSupport, {

  hasNoHosts: function () {
    return this.get('value').length === 0;
  }.property('value'),

  hasOneHost: function () {
    return this.get('value').length === 1;
  }.property('value'),

  hasMultipleHosts: function () {
    return this.get('value').length > 1;
  }.property('value'),

  otherLength: function () {
    var len = this.get('value').length;
    if (len > 2) {
      return (len - 1) + ' others';
    } else {
      return '1 other';
    }
  }.property('value')

})

App.ServiceConfigMasterHostsView = Ember.View.extend(App.ServiceConfigMultipleHostsDisplay, {

  valueBinding: 'serviceConfig.value',

  classNames: ['master-hosts', 'span6'],
  templateName: require('templates/installer/master_hosts')

});

//App.ServiceConfigSlaveHostsView = Ember.View.extend(App.ServiceConfigMultipleHostsDisplay, {
//
//  classNames: ['slave-hosts', 'span6'],
//  templateName: require('templates/installer/slave_hosts'),
//
//  controllerBinding: 'App.router.slaveComponentGroupsController',
//  valueBinding: 'App.router.slaveComponentGroupsController.hosts',
//
//  disabled: function () {
//    return !this.get('serviceConfig.isEditable');
//  }.property('serviceConfig.isEditable')
//
//});

App.AddSlaveComponentGroupButton = Ember.View.extend({

  tagName: 'span',
  slaveComponentName: null,

  didInsertElement: function () {
    this.$().popover({
      title: 'Add a ' + this.get('slaveComponentName') + ' Group',
      content: 'If you need different settings on certain ' + this.get('slaveComponentName') + 's, you can add a ' + this.get('slaveComponentName') + ' group.<br>' +
        'All ' + this.get('slaveComponentName') + 's within the same group will have the same set of settings.  You can create multiple groups.',
      placement: 'right',
      trigger: 'hover'
    });
  }

});

App.SlaveComponentGroupsMenu = Em.CollectionView.extend({
  controllerBinding: 'App.router.slaveComponentGroupsController',
  content: function(){
    return this.get('controller.componentGroups');
  }.property('controller.componentGroups'),
  tagName:'ul',
  classNames: ["nav", "nav-tabs"],

  itemViewClass:Em.View.extend({
    classNameBindings:["active"],
    active:function(){
      return this.get('content.active');
    }.property('content.active'),
    template:Ember.Handlebars.compile('<a {{action showSlaveComponentGroup view.content target="controller"}} href="#"> {{view.content.name}}</a><i {{action removeSlaveComponentGroup view.content target="controller"}} class="icon-remove"></i>')  })
});

App.ServiceConfigSlaveHostsView = Ember.View.extend(App.ServiceConfigMultipleHostsDisplay, {
  classNames: ['slave-hosts', 'span6'],
  controllerBinding: 'App.router.slaveComponentGroupsController',
  valueBinding: 'hosts',
  group: function(){
    return this.get('controller.activeGroup');
  }.property('controller.activeGroup'),
  hosts: function(){
    if (this.get('group') !== undefined)
      return this.get('controller').getHostsByGroup(this.get('group'))
  }.property('controller.hosts.@each.group', 'group'),
  templateName: require('templates/installer/slave_component_hosts'),
  disabled: function () {
    return !this.get('serviceConfig.isEditable');
  }.property('serviceConfig.isEditable')
});

App.SlaveComponentDropDownGroupView = Ember.View.extend({
  controllerBinding: 'App.router.slaveComponentGroupsController',
  optionTag: Ember.View.extend({
    selected: function(){
      var parent = this._parentView.templateData.view;
      return parent.get('content.group') === this.get('content');
    }.property('content'),
    changeGroup: function(event) {
      var parent = this._parentView.templateData.view;
      var groupName = this.get('content');
      var host = parent.get('content');
      parent.get('controller').changeHostGroup(host, groupName);
    }
  })
});

App.SlaveComponentChangeGroupNameView = Ember.View.extend({
  controllerBinding: 'App.router.slaveComponentGroupsController',
  contentBinding: 'controller.activeGroup',
  classNames: ['control-group'],
  classNameBindings: 'error',
  error: false,
  setError: function(){
    this.set('error', false);
  }.observes('controller.activeGroup'),
  errorMessage: function(){
    return this.get('error') ? 'group with this name already exist' : '';
  }.property('error'),
  changeGroupName: function(event) {
    var inputVal = $('#'+this.get('elementId') + ' input[type="text"]').val();
    if (inputVal !== this.get('content.name')){
      var result = this.get('controller').changeSlaveGroupName(this.get('content'), inputVal);
      this.set('error', result);
    }
  }
});
