var keys = {
	nodes: "0AhtG6Yl2-hiRdHpTZFIwM1dBZDY5ZUYxR3FISGRkd2c",
	annot: "0AhtG6Yl2-hiRdDlpMXRfcThXcTBjZ0Rzc3l1a0dSdFE"
}

var rand = true;
var addGraph;

document.addEventListener('DOMContentLoaded', function () {
	Tabletop.init({
		key: keys.nodes,
		callback: init
	});
});

function node() {
	this.id = null;
	this.first = null;
	this.last = null;
	this.birth = null;
	this.label = null;
	this.occupation = null;
	this.edges = null;
	this.explored = false;
}

function group(){
	this.id = null;
	this.name = null;
	this.nodes = null;
}

// Create a dictionnary of nodes and groups
function init(result) {
	
	var data = {
		nodes: {},
		groups: {},
		nodes_names: {},
		groups_names: {}
	};
	
	result.nodes.elements.forEach(function (row) {
		var n = new node();
		n.id = row.id;
		n.first = row.first;
		n.last = row.last;
		n.birth = row.birth; 
		n.occupation = row.occupation;
		n.label = row.first + ' ' + row.last + ' (' + row.birth + ')';
		n.edges = {};
		n.edges[0] = row.certain.split(', ');
		n.edges[1] = row.likely.split(', ');
		n.edges[2] = row.possible.split(', ');
		n.edges[3] = row.unlikely.split(', ');
		n.edges[4] = row.impossible.split(', ');
		data.nodes[n.id] = n;
		data.nodes_names[n.label] = n;
	});

	result.groups.elements.forEach(function (row) {
		var g = new group();
		g.id  = row.id;
		g.name = row.name;
		g.nodes = row.nodes.split(', ');
		data.groups[g.id] = g;
		data.groups_names[g.name] = g;
	});

	initGraph(data);
}

// Populate the suggested drop-down menus
// Make the buttons in the search panel functional
function initGraph(data){
	$('#one').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#two').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#three').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#entry_768090773').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#entry_1321382891').typeahead({
		local: Object.keys(data.nodes_names).sort()
	});
	$('#four').typeahead({
		local: Object.keys(data.groups_names).sort()
	});
	$('#five').typeahead({
		local: Object.keys(data.groups_names).sort()
	});
	$('#six').typeahead({
		local: Object.keys(data.groups_names).sort()
	});

	var options = {
		element: 'figure',
		with_labels: true,
		layout_attr: {
			charge: -500,
			linkDistance: 100
		},
		node_attr: {
			r: function (d) {
				if (!d.data.radius) {
					return 10;
				}
				return d.data.radius;
			},
			title: function (d) {
				return d.label;
			}
		},
		node_style: {
			fill: function (d) {
				if (!d.data.radius) {
					return '#CAE4E1';
				}
				return '#aac';
			},
			stroke: 'none'
		},
		edge_style: {
			fill: '#999',
			'stroke-width': 1
		},
		label_style: {
			fill: '#222',
			cursor: 'pointer',
			'font-size': '0.7em'
		}
	}

	showRandomNode(data, options);

	$("#findonenode").click(function () {
		if ($("#one").val()) {
			rand = false;
			Pace.restart();
			showOneNode($("#one").val(), data, options, 0);
			$('#twogroupsmenu').css('display','none');
		}
	});

	$("#findtwonode").click(function () {
		if ($("#two").val() && $("#three").val()) {
			rand = false;
			Pace.restart();
			if ($('#squaredThree')[0].checked) {
				showTable($("#two").val(), $("#three").val(), data);
				$('#squaredThree')[0].checked = false;
			} else {
				showTwoNodes($("#two").val(), $("#three").val(), data, options);
			}			
			$('#twogroupsmenu').css('display','none');
		}
	});

	$("#findonegroup").click(function () {
		if ($("#four").val()) {
			rand = false;
			Pace.restart();
			showOneGroup($("#four").val(), data);
			$('#twogroupsmenu').css('display','none');
		}
	});

	$("#findtwogroup").click(function () {
		if ($("#five").val() && $("#six").val()) {
			rand = false;
			Pace.restart();
			$('#group1').html($("#five").val());
			$('#group2').html($("#six").val());
			showOneGroup($("#five").val(), data);
		}
	});

	$("#group1").click(function () {
		showOneGroup($("#group1").html(), data);
	});

	$("#group2").click(function () {
		showOneGroup($("#group2").html(), data);
	});

	$("#group3").click(function () {
		findInterGroup($("#group1").html(), $("#group2").html(), data);
	});

	$('#submitnode').click(function(){
		rand = false;
		var node = $('#entry_1804360896').val() + ' ' + $('#entry_754797571').val() + ' (' + $('#entry_524366257').val() + ')';
		$('section').css('display','none');
		$('#addedgeform').css('display','block');
		$('#entry_768090773').val(node);
		addGraph = new jsnx.Graph();
		addGraph.add_node(node, { radius: 20 });
		jsnx.draw(addGraph, options, true);	
	});

	$('#submitedge').click(function(){
		rand = false;
		var source = $('#entry_768090773').val();
		var target = $('#entry_1321382891').val();
		addGraph.add_node(target);
		addGraph.add_edge(source, target);
	});
}

function showRandomNode(data, options) {
	if (!rand) return;
	var parent = data.nodes[Math.floor((Math.random()*Object.keys(data.nodes).length - 1))].label;
	showOneNode(parent, data, options, 0, null, true);
	if (rand) {
		setTimeout(function(){
			showRandomNode(data, options)
		}, 15000);
	}
}

function showOneNode(parent, data, options, confidence, graph, random) {
	var isNew = false;
	if (!graph) {
		graph = new jsnx.Graph();
		isNew = true;
	}
	var p = data.nodes_names[parent];
	p.explored = true;
	var edges = [];
	var nodes = [];
	// var k = Math.ceil((p.id + 1) / 250) / 10;
	// var key = keys['edges' + Math.ceil(k)];
	p.edges[confidence].forEach(function (edge){
		var f = data.nodes[edge];
		nodes.push(f.label);
		edges.push([p.label, f.label]);
		f.edges[confidence].forEach(function (e){
			var s = data.nodes[e];
			if (nodes.indexOf(s.label) >= 0 || graph.nodes().indexOf(s.label) >= 0) {
				edges.push([f.label, s.label]);
			}
		});
	});
	
	if (isNew) {
		$('figure').html('');
		$("#results").html("Network of " + parent);
		graph.add_nodes_from(nodes, { first: true });
		graph.add_node(p.label, { radius: 20, first: true });
		jsnx.draw(graph, options, true);
	} else {
		graph.add_nodes_from(nodes);
	}
	graph.add_edges_from(edges);
	if (random) {
		if (rand) {
			jsnx.draw(graph, options);
		}
	} else {
		$("#one").val('');
		$("#one").typeahead('setQuery', '');
		d3.selectAll('.node').on('click', function (d) {
			if(data.nodes_names[d.node].explored) {
				var n = data.nodes_names[d.node];
				n.explored = false;
				n.edges[confidence].forEach(function (e){
					if (graph.node.get(data.nodes[e].label) && !(graph.node.get(data.nodes[e].label).first)) {
						graph.remove_node(data.nodes[e].label);
					}
				});
				graph.nodes().forEach(function (e){
					if (Object.keys(graph.adj.get(e).F).length == 0 && graph.node.get(e).radius != 20) {
						graph.remove_node(e);
					}
				});
			} else {
				showOneNode(d.node, data, options, 0, graph);
			}
		});
	}
}

function showTwoNodes(person1, person2, data, options) {
	$('figure').html('');
	var G = jsnx.Graph();
	var edges = [];
	var p1 = data.nodes_names[person1];
	var p2 = data.nodes_names[person2];
	var e1 = [];
	var e2 = [];
	for (var i = 0; i < 5; i ++) {
		e1.push.apply(e1, p1.edges[i]);
		e2.push.apply(e2, p2.edges[i]);	
	}
	e1.forEach(function (edge){
		if (e2.indexOf(edge) >= 0) {
			var label = data.nodes[edge].label;
			G.add_node(label);
			edges.push([p1.label, label]);
			edges.push([p2.label, label]);
		}
	});
	G.add_nodes_from([p1.label, p2.label], { radius: 20 });
	G.add_edges_from(edges);
	jsnx.draw(G, options);
	$("#results").html("Common network between " + person1 + " and " + person2);
	$("#two").val('');
	$("#two").typeahead('setQuery', '');
	$("#three").val('');
	$("#three").typeahead('setQuery', '');
}

function showTable(person1, person2, data) {
	$('figure').html('');
	var p1 = data.nodes_names[person1];
	var p2 = data.nodes_names[person2];
	var common = [];
	var e1 = [];
	var e2 = [];
	for (var i = 0; i < 5; i ++) {
		e1.push.apply(e1, p1.edges[i]);
		e2.push.apply(e2, p2.edges[i]);
	}
	e1.forEach(function (edge){
		if (e2.indexOf(edge) >= 0) {
			common.push(data.nodes[edge]);
		}
	});
	writeTableWith(common);
	$("#results").html("Common network between " + person1 + " and " + person2);
	$("#two").val('');
	$("#two").typeahead('setQuery', '');
	$("#three").val('');
	$("#three").typeahead('setQuery', '');
}

function showOneGroup(group, data) {
	var g = data.groups_names[group];
	var results = [];
	g.nodes.forEach(function (node) {	
		results.push(data.nodes[node]);
	});
	writeTableWith(results);
	$("#results").html("People who belong to the " + group + " group");
}

// Display the intersections between group1 and group2
function findInterGroup(group1, group2, data) {
	var g1 = data.groups_names[group1];
	var g2 = data.groups_names[group2];
	var common = [];
	g1.nodes.forEach(function (node) {
		if (g2.nodes.indexOf(node) >= 0) {
			common.push(data.nodes[node]);
		}
	});
	writeTableWith(common);
	$("#results").html("Intersection between " + group1 + " and " + group2);
}

// Create the table container
function writeTableWith(dataSource){
    $('figure').html('<table cellpadding="0" cellspacing="0" border="0" class="display table table-bordered table-striped" id="data-table-container"></table>');
    $('#data-table-container').dataTable({
		'sPaginationType': 'bootstrap',
		'iDisplayLength': 10,
        'aaData': dataSource,
        'aoColumns': [
            {'mDataProp': 'first', 'sTitle': 'First Name'},
            {'mDataProp': 'last', 'sTitle': 'Last Name'},
            {'mDataProp': 'occupation', 'sTitle': 'Occupation'}
        ],
        'oLanguage': {
            'sLengthMenu': '_MENU_ records per page'
        }
    });
};

// Define two custom functions (asc and desc) for string sorting
jQuery.fn.dataTableExt.oSort['string-case-asc']  = function(x,y) {
	return ((x < y) ? -1 : ((x > y) ?  0 : 0));
};

jQuery.fn.dataTableExt.oSort['string-case-desc'] = function(x,y) {
	return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};