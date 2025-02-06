import path from "path"
import TsConfigPathsPlugin from "tsconfig-paths-webpack-plugin"

const rootDir = process.cwd()

const srcFolder = path.resolve(rootDir, "src")

export default {
  mode: "production",
  entry: {
    bundle: "./src/background.ts",
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            },
          }
        ],
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            targets: "defaults",
            presets: [
              ["@babel/preset-env"]
            ]
          }
        }
      }
    ],
  },
  resolve: {
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.resolve(rootDir, "tsconfig.json"),
      }),
    ],
    alias: {
      "@/*": srcFolder,
    },
    modules: ["node_modules", srcFolder],
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(rootDir, "publish/dist"),
  },
}