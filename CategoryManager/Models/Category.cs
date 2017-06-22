using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CategoryManager.Models
{
    public class Category
    {
        public int? Id { get; set; }
        public string Name { get; set; }
        public int? ParentId { get; set; }
        public Category[] Children { get; set; }
        //public List<Category> Children { get; set; }
    }
}