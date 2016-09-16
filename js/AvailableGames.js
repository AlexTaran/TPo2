
var AvailableGames = {
  "32/7":             {target: 32,   dims: [7, 1],             obstacles: []},
  "128/9":            {target: 128,  dims: [9, 1],             obstacles: []},
  // 2D games
  "2048/4x4":         {target: 2048, dims: [4, 4],             obstacles: []},
  "4096/4x4":         {target: 4096, dims: [4, 4],             obstacles: []},
  "8192/4x4":         {target: 8192, dims: [4, 4],             obstacles: []},
  "1024/4x4/C":       {target: 1024, dims: [4, 4],             obstacles: [[1, 1]]},
  "2048/4x4/C":       {target: 2048, dims: [4, 4],             obstacles: [[1, 1]]},
  "256/4x4/E":        {target: 256,  dims: [4, 4],             obstacles: [[1, 1], [1, 2], [2, 1], [2, 2]]},
  "65536/5x5":        {target: 65536,dims: [5, 5],             obstacles: []},
  // 3D games
  "4096/3x3x3":       {target: 4096, dims: [3, 3, 3],          obstacles: []},
  "4096/4x2x3":       {target: 4096, dims: [4, 2, 3],          obstacles: []},
  "2048/3x3x3/C":     {target: 2048, dims: [3, 3, 3],          obstacles: [[1, 1, 1]]},
  "8192/4x4x4/C":     {target: 8192, dims: [4, 4, 4],          obstacles: [[1, 1, 1], [1, 1, 2], [1, 2, 1], [1, 2, 2], [2, 1, 1], [2, 1, 2], [2, 2, 1], [2, 2, 2]]}, 
  // 4D games
  "2048/2x2x2x2":     {target: 2048, dims: [2, 2, 2, 2],       obstacles: []},
  "4096/3x3x2x3":     {target: 4096, dims: [3, 3, 2, 3],       obstacles: []},
  // 5D games
  "4096/2x2x2x2x2":   {target: 4096, dims: [2, 2, 2, 2, 2],    obstacles: []},
  // 6D games
  "8192/2x2x2x2x2x2": {target: 8192, dims: [2, 2, 2, 2, 2, 2], obstacles: []},
};


function createGameSceneByName(name) {
  if (name in AvailableGames) {
    var gameParams = AvailableGames[name];
    var gameScene = new GameScene(name, gameParams.dims, gameParams.target, gameParams.obstacles);
    return gameScene;
  } else {
    return null;
  }
}
