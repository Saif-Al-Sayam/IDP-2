import pandas as pd
import numpy as np
import requests
from io import StringIO

def load_data(source):
    """Load dataset from URL or file"""
    try:
        if source.startswith('http'):
            print(f"📥 Getting {source}...")
            response = requests.get(source)
            data = pd.read_csv(StringIO(response.text))
        else:
            print(f"📥 Reading {source}...")
            data = pd.read_csv(source)
        print(f"✓ Loaded {len(data)} rows, {len(data.columns)} columns")
        return data
    except Exception as e:
        print(f"❌ Failed: {e}")
        return None

def check_data(df, name="dataset"):
    """Check dataset for issues"""
    print(f"\n🔍 Checking {name}...")
    
    # Basic info
    print(f"📊 Shape: {df.shape[0]} rows, {df.shape[1]} cols")
    print(f"🧹 Missing: {df.isnull().sum().sum()} values")
    print(f"♻️  Duplicates: {df.duplicated().sum()} rows")
    
    issues = []
    
    # Check ID conflicts
    id_cols = [col for col in df.columns if 'id' in col.lower()]
    for id_col in id_cols:
        dupes = df[df.duplicated(subset=[id_col], keep=False)]
        if not dupes.empty:
            for other_col in df.columns:
                if other_col != id_col:
                    conflicts = dupes.groupby(id_col)[other_col].nunique()
                    if conflicts.max() > 1:
                        issues.append(f"ID {id_col} has conflicting {other_col} values")
                        break
    
    # Check number ranges
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        if 'age' in col.lower() and (df[col] < 0).any():
            issues.append(f"Negative values in {col}")
        if any(x in col.lower() for x in ['price','salary']) and (df[col] < 0).any():
            issues.append(f"Negative values in {col}")
    
    # Check dates
    date_cols = [col for col in df.columns if 'date' in col.lower()]
    for i, col1 in enumerate(date_cols):
        for col2 in date_cols[i+1:]:
            try:
                df[col1] = pd.to_datetime(df[col1], errors='coerce')
                df[col2] = pd.to_datetime(df[col2], errors='coerce')
                if (df[col1] > df[col2]).any():
                    issues.append(f"{col1} after {col2}")
            except:
                pass
    
    return issues

def show_stats(df):
    """Show quick statistics"""
    print(f"\n📈 Quick stats:")
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols[:3]:  # Show first 3 numeric columns
        print(f"   {col}: {df[col].mean():.1f} avg, {df[col].min():.1f}-{df[col].max():.1f} range")

def main():
    print("🔍 Data Health Check")
    print("=" * 30)
    
    # Sample datasets
    samples = {
        "1": "https://raw.githubusercontent.com/datasets/iris/master/data/iris.csv",
        "2": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv",
        "3": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/diamonds.csv"
    }
    
    print("\nTry these samples:")
    for k, v in samples.items():
        print(f"   {k}. {v.split('/')[-1]}")
    
    choice = input("\nPick (1-3) or paste your URL/path: ").strip()
    
    if choice in samples:
        source = samples[choice]
        name = source.split('/')[-1]
    else:
        source = choice
        name = choice.split('/')[-1] if '/' in choice else choice
    
    df = load_data(source)
    
    if df is not None:
        print(f"\nFirst look:")
        print(df.head(2))
        
        issues = check_data(df, name)
        show_stats(df)
        
        print(f"\n🚨 Found {len(issues)} issues:")
        for issue in issues[:5]:  # Show first 5 issues
            print(f"   • {issue}")
        
        if not issues:
            print("   ✅ Looks good!")
        
        # Save summary
        with open(f"check_{name}.txt", 'w') as f:
            f.write(f"Data check for {name}\n")
            f.write(f"Issues: {len(issues)}\n")
            for issue in issues:
                f.write(f"- {issue}\n")
        print(f"\n💾 Saved to check_{name}.txt")

if __name__ == "__main__":
    main()
