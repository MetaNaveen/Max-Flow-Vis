function test1 () {
    var nodes_data = [
        {
          "id": "0",
          "position": {
            "x": 239,
            "y": 265.8000030517578
          }
        },
        {
          "id": "1",
          "position": {
            "x": 445,
            "y": 121.80000305175781
          }
        },
        {
          "id": "2",
          "position": {
            "x": 616,
            "y": 270.8000030517578
          }
        }
      ];

      var edges_data = [
        {
          "id": "1_2",
          "source": "1",
          "target": "2",
          "totalCapacity": 2,
          "usedCapacity": 0,
          "customLabel": "0/2"
        },
        {
          "id": "0_2",
          "source": "0",
          "target": "2",
          "totalCapacity": 1,
          "usedCapacity": 0,
          "customLabel": "0/1"
        },
        {
          "id": "0_1",
          "source": "0",
          "target": "1",
          "totalCapacity": 4,
          "usedCapacity": 0,
          "customLabel": "0/4"
        }
      ];

      return {
          nodes: nodes_data,
          edges: edges_data
      };
}