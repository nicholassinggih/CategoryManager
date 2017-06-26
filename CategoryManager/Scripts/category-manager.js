$(function () {
    var categoryOptionsTemplate, editCategoryTemplate, categoryListTemplate, categoryMainTemplate;
    var $inputDialog = $("#edit-category-div");

    $inputDialog.addClass("modal-content");
    $inputDialog.dialog({
        autoOpen: false,
        modal: true,
        height: 18,
        width: 150,
        open: function (event, ui) {
            // remove the title bar
            $(".ui-dialog-titlebar").hide();
            $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
            $(this).css({
                position: "fixed",
                left: $inputDialog.position.x,
                top: $inputDialog.position.y
            })
        }
    });

    function saveCategory(categoryDetails) {
        var category = new myCategory();
        if (categoryDetails.id == null) {
            category.isNew();
        }
        category.save(categoryDetails, {
            success: function () {
                categoryListingView.render();
            }
        });
    };

    $(".edit-category-form").on("submit", function (ev) {
        ev.preventDefault();
        $inputDialog.dialog("close");
        var categoryDetails = $(ev.currentTarget).serializeObject();
        if (!categoryDetails.id || categoryDetails.id.trim() == '') categoryDetails.id = null;
        if (categoryDetails.parentId && categoryDetails.parentId.trim() == '') categoryDetails.parentId = null;

        saveCategory(categoryDetails);
        return false;
    });

    $(".btn.my-add-root").on("click", function (e) {
        e.preventDefault();
        showEditCategoryForm({
            position: {
                x: e.pageX + 100,
                y: e.pageY - 14
            }
        });
    });



    function resetForm() {
        $(".edit-category-form")[0].reset();
    }

    function showEditCategoryForm(options) {
        var data = options && options.data? options.data : {};
        resetForm();
        $("#categoryId").val(data.Id);
        if (!data.Id) $("#categoryId").removeAttr("value");
        $("#categoryName").val(data.Name);
        if (!data.Name) $("#categoryName").removeAttr("value");
        $("#categoryParentId").val(data.ParentId);
        if (!data.ParentId) $("#categoryParentId").removeAttr("value");

        $inputDialog.position = { x: options.position.x, y: options.position.y };
        $inputDialog.dialog("open");        

    }

    /*
        This function creates a Backbone Tree View node for a given Category JSON object
    */
    function convertDataToTreeNode(data) {
        if (!data) return null;
        if (data.constructor === Array) {
            var coll = [];
            $.each(data, function (index, cat) {
                coll.push(convertDataToTreeNode(cat));
            });
            return coll;
        }
        return {
            Id: data.Id,
            title: data.Name,
            ParentId: data.ParentId,
            Name: data.Name,
            open: true,
            nodes: convertDataToTreeNode(data.Children)
        };
    }


    function buildTree(data) {
        var lastMovedObject = null;

        var ItemView = BackTree.Item.extend({
            onChildrenChangedHandler: function (e) {
                if (!lastMovedObject) return;
                if (lastMovedObject.collection.parent && lastMovedObject.collection.parent.attributes.Id == e.model.attributes.Id) {
                    lastMovedObject.attributes.ParentId = e.model.attributes.Id;
                    saveCategory({
                        id: lastMovedObject.attributes.Id,
                        name: lastMovedObject.attributes.Name,
                        parentId: e.model.attributes.Id
                    });
                    lastMovedObject = null;
                } else if (lastMovedObject.collection && !lastMovedObject.collection.parent) {
                    saveCategory({
                        id: lastMovedObject.attributes.Id,
                        name: lastMovedObject.attributes.Name,
                        parentId: null
                    });
                    lastMovedObject = null;
                }
            },
            events: function () {
                var events = ItemView.__super__.events.apply(this, arguments);
                events['click > .wrapper .my-add'] = function (e) {
                    e.preventDefault();
                    showEditCategoryForm({
                        data: {
                            ParentId: this.model.toJSON().Id
                        },
                        position: {
                            x: e.pageX - 180,
                            y: e.pageY - 14
                        }
                    });
                };
                events['click > .wrapper .my-e'] = function (e) {
                    e.preventDefault();
                    showEditCategoryForm({
                        data: {
                            Id: this.model.toJSON().Id,
                            ParentId: this.model.toJSON().ParentId,
                            Name: this.model.toJSON().Name
                        },
                        position: {
                            x: e.pageX - 180,
                            y: e.pageY - 14
                        }
                    });
                };

                events['click > .wrapper .my-x'] = function (e) {
                    e.preventDefault();
                    if (confirm("Are you sure you want to delete this? ")) {
                        var cat = new myCategory({ id: this.model.toJSON().Id });
                        cat.fetch({
                            success: function (cat) {
                                cat.destroy({
                                    success: function () {
                                        categoryListingView.render();
                                    }
                                });
                            }
                        });
                    }
                    
                };
                
                events['mouseup > .wrapper '] = function (e) {
                    lastMovedObject = this.model;
                };
                
                return events;
            },
            getRightPart: function () {
                var out = '<a href="#" title="Create child category" class="btn btn-success btn-xs my-add">+</a> ';
                out += '<a href="#" class="btn btn-warning btn-xs my-e">Rename</a> ';
                out += '<a href="#" title="Delete this category" class="btn btn-danger btn-xs my-x">X</a>';

                return out;
            }
        });
        return new BackTree.Tree({
            collection: new BackTree.Collection(convertDataToTreeNode(data)),
            settings: {
                ItemConstructor: ItemView,
                plugins: {
                    DnD: {
                        
                    }
                }
            }
        });
    }

    

    var myCategories = Backbone.Collection.extend({
        url: '/api/category'
    });

    var myCategory = Backbone.Model.extend({
        urlRoot: '/api/category'
    });

    var categoryListing = Backbone.View.extend({
        el: '.content',
        render: function () {
            var that = this;
            var categories = new myCategories();
            categories.fetch({
                success: function (categories) {
                    var catList = [];
                    $.each(categories.models, function () {
                        catList.push(this.toJSON());
                    });
                    var tree = buildTree(catList);
                    that.$el.empty();
                    that.$el.append(tree.render().$el);
                }
            });
        }
    });

    var categoryListingView = new categoryListing();
    
    /* ------------------------ BEGIN ROUTE SECTION ----------------------------------*/
    var myRouter = Backbone.Router.extend({
        routes: {
            '': 'home'
        }
    });

    var router = new myRouter();
    router.on('route:home', function () {
        categoryListingView.render();
    });
    
    /* ------------------------ END ROUTE SECTION ------------------------------------*/

    Backbone.history.start();



});
