Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:[
         {
            xtype: 'container',
            itemId: 'boxContainer'
        },
        {
            xtype: 'container',
            itemId: 'gridContainer'
        }
    ],
    launch: function() {
        var filters = Ext.create('Rally.data.QueryFilter', {
                property: 'ElementName',
                operator: '=',
                value: 'Defect'
            });
            filters = filters.or({
                property: 'ElementName',
                operator: '=',
                value: 'HierarchicalRequirement'  
            });
            //filters = filters.or({
            //    property: 'ElementName',
            //    operator: '=',
            //    value: 'TestCase'  
            //});
            //filters = filters.or({
            //    property: 'ElementName',
            //    operator: '=',
            //    value: 'Task'  
            //});
            
        var typeDefCombobox = Ext.create('Rally.ui.combobox.ComboBox', {
                itemId: 'typeDefCombobox',
                storeConfig: {
                    autoLoad: true,
                    model: 'TypeDefinition',
                    fetch: ['Attributes','ElementName'],
                    valueField: 'ElementName',  
                    filters:[filters],
                    limit: Infinity
                },
                listeners:{
                    ready: function(combobox){
                        this._loadCustomFields(combobox.getRecord());
                    },
                    select: function(combobox){
                        this._loadCustomFields(combobox.getRecord());
                    },
                    scope: this
   		}
            });
            this.down('#boxContainer').add(typeDefCombobox);
    },
    _loadCustomFields:function(record){
        var that = this;
        var attributes = record.getCollection('Attributes');
        var count = attributes.getCount();
        var pendingAttributes = count;
        var fieldsArray = [];
        var valuesArray = [];
        attributes.load({
            fetch:['ElementName','Custom','AttributeType','AllowedValues'],
            callback: function(fields, operation, success){
                _.each(fields, function(field){
                    if (field.get('Custom') === true) {
                        if (field.get('AttributeType') === 'STRING') {
                            console.log('allowedvalues', field.get('AllowedValues')._ref);
                            var allowedValues = field.getCollection('AllowedValues');
                            var countOfAllowedValues = allowedValues.getCount();
                            var pendingAllowedValues = countOfAllowedValues;
                            allowedValues.load({
                                fetch:['StringValue'],
                                callback: function(values, operation, success){
                                    _.each(values, function(value){
                                        valuesArray.push(value.get('StringValue'));
                                        console.log('value', value.get('StringValue'));
                                        pendingAllowedValues--;
                                        if (pendingAllowedValues === 0) {
                                            //
                                        }
                                    });
                                }
                            });
                        }
                        fieldsArray.push({'name':field.get('ElementName'),'type':field.get('AttributeType'),'values':allowedValuesArray});
                    }
                    pendingAttributes--;
                    if (pendingAttributes === 0) {
                        that._makeGrid(fieldsArray);
                    }
                    
                }); 
            }
        });
    },
    _makeGrid:function(fields){
        console.log(fields);
        if (fields.length>0) { 
            var store = Ext.create('Rally.data.custom.Store', {
                fields: ['name','type'],
                data: fields
            });
        }
        if (this.down('rallygrid')) {
            Ext.ComponentQuery.query('#gridContainer')[0].remove(Ext.ComponentQuery.query('#attributeGrid')[0], true);
        }
         this.down('#gridContainer').add({
            xtype: 'rallygrid',
            itemId: 'attributeGrid',
            store: store,
            enableEditing: false,
            showRowActionsColumn: false,
            columnCfgs: [
                {text: 'Name', dataIndex: 'name'},
                {text: 'Type', dataIndex: 'type'},
                {
                    text: 'Values', dataIndex: 'values', 
                    renderer: function(value) {
                        var html = [];
                        _.each(value, function(v){
                            html.push(v)
                        });
                        return html.join(', ');
                    }
                }
            ]
        });

        
    }
});
