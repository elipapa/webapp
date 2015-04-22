var tnt_tree = require("tnt.tree");
var tnt_tooltip = require("tnt.tooltip");

var geneAssociationsTree = function () {
    "use strict";

    var config = {
	data : undefined,
	diameter : 1000,
	cttvApi : undefined,
	datatypes: undefined
    };
    var treeVis = tnt_tree();
    
    // var scale = d3.scale.quantize()
    // 	.domain([1,1])
    // 	.range(["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"]);
    var scale = d3.scale.linear()
	.domain([0,1])
	.range(["#f7f7f7", "#2166ac"]);

    function lookDatasource (arr, dsName) {
	for (var i=0; i<arr.length; i++) {
	    var ds = arr[i];
	    if (ds.datatype === dsName) {
		return {
		    "count": ds.evidence_count,
		    "score": ds.association_score
		};
	    }
	}
	return {
	    "count": 0,
	    "score": 0
	};
    }

    function hasActiveDatatype (checkDatatype) {
	for (var datatype in config.datatypes) {
	    if (datatype === checkDatatype) {
		return true;
	    }
	}
	return false;
    }

    function render (flowerView, div) {
	var data = config.data;
    
	// tooltips
	var nodeTooltip = function (node) {
	    var obj = {};
	    var score = node.property("association_score");
	    obj.header = node.property("label") + " (Association score: " + score + ")";
	    var loc = "#/evidence/" + config.target + "/" + node.property("efo_code");
	    //obj.body="<div></div><a href=" + loc + ">View evidence details</a><br/><a href=''>Zoom on node</a>";
	    obj.rows = [];
	    obj.rows.push({
		value : "<a class=cttv_flowerLink href=" + loc + "><div></div></a>"
	    });
	    obj.rows.push({
		value: "<a href=" + loc + ">View evidence details</a>"
	    });
	    obj.rows.push({
		value : node.is_collapsed() ? "Uncollapse children" : "Collapse children",
		link : function (n) {
		    n.toggle();
		    theme.update();
		},
		obj: node
	    });

	    if (treeVis.has_focus(node)) {
		obj.rows.push({
		    value : "Release focus",
		    link : function (n) {
			treeVis.release_focus(n)
			    .update();
			// re-insert the titles
			d3.selectAll(".tnt_tree_node")
			    .append("title")
			    .text(function (d) {
				return d.label;
			    });
		    },
		    obj : node
		});
	    } else {
		obj.rows.push({
		    value:"Set focus on node",
		    link : function (n) {
			treeVis.focus_node(n, true)
			    .update();
			// re-insert the titles
			d3.selectAll(".tnt_tree_node")
			    .append("title")
			    .text(function (d) {
				return d.label;
			    });
		    },
		    obj: node
		});
	    }

	    var t = tnt_tooltip.list()
		.id(1)
		.width(180);
	    // Hijack tooltip's fill callback
	    var origFill = t.fill();

	    // Pass a new fill callback that calls the original one and decorates with flowers
	    t.fill (function (data) {
		origFill.call(this, data);
		var datatypes = node.property("datatypes");
		var flowerData = [
		    {"value":lookDatasource(datatypes, "genetic_association").score, "label":"Genetics", "active": hasActiveDatatype("genetic_association",config.datatypes)},
		    {"value":lookDatasource(datatypes, "somatic_mutation").score,  "label":"Somatic", "active": hasActiveDatatype("somatic_mutation", config.datatypes)},
		    {"value":lookDatasource(datatypes, "known_drug").score,  "label":"Drugs", "active": hasActiveDatatype("known_drug", config.datatypes)},
		    {"value":lookDatasource(datatypes, "rna_expression").score,  "label":"RNA", "active": hasActiveDatatype("rna_expression", config.datatypes)},
		    {"value":lookDatasource(datatypes, "affected_pathway").score,  "label":"Pathways", "active": hasActiveDatatype("affected_pathway", config.datatypes)},
		    {"value":lookDatasource(datatypes, "animal_model").score,  "label":"Models", "active": hasActiveDatatype("animal_model", config.datatypes)}
		];
		flowerView
		    .diagonal(150)
		    .values(flowerData)(this.select("div").node());
	    });

	    t.call(this, obj);
	};

	treeVis
	    .data(config.data)
	    .node_display(tnt_tree.node_display.circle()
	    		  .size(8)
	    		  .fill(function (node) {
	    		      return scale(node.property("association_score"));
	    		  })
	    		 )
	    .on_click(nodeTooltip)
	    .label(tnt_tree.label.text()
		   .height(20)
	    	   .text(function (node) {
	    	       if (node.is_leaf()) {
	    		   var diseaseName = node.property("label");
	    		   if (diseaseName.length > 30) {
	    		       diseaseName = diseaseName.substring(0,30) + "...";
	    		   }
			   if (node.is_collapsed()) {
			       diseaseName += (" (+" + node.n_hidden() + ")");
			   }
	    		   return diseaseName;
	    	       }
	    	       return "";
	    	   })
	    	   .fontsize(14)
	    	  )
	    .layout(tnt_tree.layout.vertical()
	    	    .width(config.diameter)
	    	    .scale(false)
	    	   );

	treeVis(div.node());
	d3.selectAll(".tnt_tree_node")
	    .append("title")
	    .text(function (d) {
		return d.label;
	    });

    }
    
    // deps: tree_vis, flower
    var theme = function (flowerView, div) {
	var vis = d3.select(div)
	    .append("div")
	    .style("position", "relative");

	if ((config.data === undefined) && (config.target !== undefined) && (config.cttvApi !== undefined)) {
	    var api = config.cttvApi;
	    var url = api.url.associations({
		gene : config.target,
		datastructure : "tree",
		// TODO: Add datatypes here!
	    });
	    api.call(url)
		.then (function (resp) {
		    config.data = resp.body.data;
		    render(flowerView, vis);
		});
	} else {
	    render(flowerView, vis);
	}
    };

    theme.update = function () {
	treeVis.data(config.data);
	treeVis.update();
	d3.selectAll(".tnt_tree_node")
	    .append("title")
	    .text(function (d) {
		return d.label;
	    });
    };
    
    // size of the tree
    theme.diameter = function (d) {
	if (!arguments.length) {
	    return config.diameter;
	}
	config.diameter = d;
	return this;
    };
    
    //
    theme.target = function (t) {
	if (!arguments.length) {
	    return config.target;
	}
	config.target = t;
	return this;
    };

    theme.cttvApi = function (api) {
	if (!arguments.length) {
	    return config.cttvApi;
	}
	config.cttvApi = api;
	return this;
    };
    
    // data is object
    theme.data = function (d) {
	if (!arguments.length) {
	    return config.data;
	}
	config.data = d;
	return this;
    };

    // datatypes
    theme.datatypes = function (dts) {
	if (!arguments.length) {
	    return config.datatypes;
	}
	config.datatypes = dts;
	return this;
    };

    return theme;
};

module.exports = exports = geneAssociationsTree;