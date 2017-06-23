var myCategories = Backbone.Collection.extend({
    url: '/api/category'
});

var myCategory = Backbone.Model.extend({
    urlRoot: '/api/category'
});

var editCategory = Backbone.View.extend({
    el: '.content',
    render: function (options) {
        var that = this;
        var renderEdit = function (cat) {

            var others = new myCategories();
            var parentOptions = "";
            var catId = cat ? cat.Id : 0;
            var parentId = cat ? cat.ParentId : 0;
            others.fetch({
                url: '/api/category/othersExcludingChildren/' + catId,
                success: function (categories) {
                    var catList = [];
                    $.each(categories.models, function () {
                        catList.push(this.toJSON());
                    });
                    var parentOptions = _.template($("#parent-options-template").html())({ cats: catList, parentId: parentId });
                    var template = _.template($('#edit-category-template').html())({ cat: cat ? cat : null, parentOptions: parentOptions });
                    that.$el.html(template);
                }
            });
        };

        if (options && options.id) {
            var cat = new myCategory({ id: options.id });
            cat.fetch({
                success: function (cat) {
                    renderEdit(cat.toJSON());
                }
            });
        } else {
            renderEdit(null);
        }
    },
    events: {
        'submit .edit-template-form': 'saveCategory',
        'click #cancel-edit-btn': 'displayMain'
    },
    saveCategory: function (ev) {
        var categoryDetails = $(ev.currentTarget).serializeObject();
        var category = new myCategory();
        category.save(categoryDetails, {
            success: function () {
                router.navigate('', { trigger: true });
            }
        });
        console.log(categoryDetails);
        return false;
    },
    displayMain: function (ev) {
        router.navigate('', { trigger: true });
    }
})

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
                var renderChildren = _.template($("#category-listing-template").html());
                var template = _.template($("#category-main-template").html())({ cats: catList, renderChildren: renderChildren });
                that.$el.html(template);
            }
        });
    }
});

var categoryListingView = new categoryListing();
var editCategoryView = new editCategory();


/* ------------------------ BEGIN ROUTE SECTION ----------------------------------*/
var myRouter = Backbone.Router.extend({
    routes: {
        '': 'home',
        'new': 'editCategory',
        'edit/:id': 'editCategory',
        'delete/:id': 'deleteCategory'
    }
});

var router = new myRouter();
router.on('route:home', function () {
    categoryListingView.render();
});
router.on('route:editCategory', function (id) {
    editCategoryView.render({ id: id });
})
router.on('route:deleteCategory', function (id) {
    if (confirm("Are you sure?")) {
        var cat = new myCategory({ id: id });
        cat.fetch({
            success: function (cat) {
                cat.destroy({
                    success: function () {
                        router.navigate('', { trigger: true });
                    }
                });
            }
        });
    }
    categoryListingView.render();
})
/* ------------------------ END ROUTE SECTION ------------------------------------*/

Backbone.history.start();