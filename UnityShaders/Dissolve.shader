Shader "Custom/Dissolve" {
	Properties {
		_Color ("Color", Color) = (1,1,1,1)
		_MainTex ("Albedo (RGB)", 2D) = "white" {}
		_Glossiness ("Smoothness", Range(0,1)) = 0.5
		_Metallic ("Metallic", Range(0,1)) = 0.0
		_MaskTex ("Mask Texture", 2D) = "white" {}
		_Threshold("Threshold", Range(0, 1)) = 0
		_Edge("Edge", Range(0, 1)) = 0.05
		[Toggle] _UseEmmisiveEdge("Emmisive Edge", Float) = 0
		[HDR] _EmmisiveEdgeColor1("Emittion Edge Color 1", Color) = (1,1,1,1)
		[HDR] _EmmisiveEdgeColor2("Emittion Edge Color 2", Color) = (1,1,1,1)
	}
	SubShader {
        Tags {"Queue" = "Transparent" "RenderType" = "Transparent"}
		LOD 200

		CGPROGRAM
		// Physically based Standard lighting model, and enable shadows on all light types
		#pragma surface surf Standard fullforwardshadows alpha:fade addshadow //vertex:vert

		// Use shader model 3.0 target, to get nicer looking lighting
		#pragma target 3.0

		sampler2D _MainTex;

		struct Input {
			float2 uv_MainTex;
		};

		half _Glossiness;
		half _Metallic;
		fixed4 _Color;
		sampler2D _MaskTex;
		half _Threshold;
		half _Edge;
		fixed _UseEmmisiveEdge;
		half4 _EmmisiveEdgeColor1;
		half4 _EmmisiveEdgeColor2;


		// Add instancing support for this shader. You need to check 'Enable Instancing' on materials that use the shader.
		// See https://docs.unity3d.com/Manual/GPUInstancing.html for more information about instancing.
		// #pragma instancing_options assumeuniformscaling
		UNITY_INSTANCING_BUFFER_START(Props)
			// put more per-instance properties here
		UNITY_INSTANCING_BUFFER_END(Props)

		/*
		void vert(inout appdata_full v, out Input o) {
            UNITY_INITIALIZE_OUTPUT(Input,o);
		}
		*/

		void surf (Input IN, inout SurfaceOutputStandard o) {
			
			half maskValue = tex2D (_MaskTex, IN.uv_MainTex).r;
			half halfEdge = 0.5 * _Edge;
			half adjust = (_Edge +0.001) * (_Threshold-0.5);
			/*
			half dissolveAlpha = 1;
			if(maskValue < _Threshold - halfEdge + adjust )
				discard;
			else if(_Edge > 0 && maskValue < _Threshold + halfEdge + adjust )
				dissolveAlpha = 1 - (_Threshold + halfEdge + adjust - maskValue) / _Edge;
			*/
			clip(maskValue - (_Threshold - halfEdge + adjust));
			// smoothstep or clamp
			half dissolveAlpha = smoothstep(_Threshold - halfEdge + adjust, 
											_Threshold + halfEdge + adjust,
											maskValue);

			// Albedo comes from a texture tinted by color
			fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _Color;
			half4 EdgeColor = lerp(_EmmisiveEdgeColor2, _EmmisiveEdgeColor1, dissolveAlpha);
			// onEmissiveEdge > 0 is true only when emmisive edge & in edge area
			fixed onEmissiveEdge = ( _UseEmmisiveEdge - dissolveAlpha > 0 ? 1 : 0);
			o.Albedo = c.rgb * (1-onEmissiveEdge) + EdgeColor * onEmissiveEdge;
			o.Emission = EdgeColor * onEmissiveEdge;
			// Metallic and smoothness come from slider variables
			o.Metallic = _Metallic;
			o.Smoothness = _Glossiness;
			// use 1 or dissolveAlpha
			o.Alpha = c.a * (EdgeColor.a * _UseEmmisiveEdge + dissolveAlpha * (1-_UseEmmisiveEdge));
		}
		ENDCG
	}
	FallBack "Transparent/Diffuse"
}
