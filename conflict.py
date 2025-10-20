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
            if response.status_code != 200:
                print(f"❌ HTTP Error {response.status_code}")
                return None
            data = pd.read_csv(StringIO(response.text))
        else:
            print(f"📥 Reading {source}...")
            data = pd.read_csv(source)
        print(f"✓ Loaded {len(data)} rows, {len(data.columns)} columns")
        return data
    except Exception as e:
        print(f"❌ Failed: {e}")
        return None

def check_data(df, name="dataset", show_conflicts=True):
    """Check dataset for issues"""
    print(f"\n🔍 Checking {name}...")
    
    issues = []
    conflict_details = []
    
    # Check ID conflicts
    id_cols = [col for col in df.columns if 'id' in col.lower()]
    for id_col in id_cols:
        dupes = df[df.duplicated(subset=[id_col], keep=False)]
        if not dupes.empty:
            for other_col in df.columns:
                if other_col != id_col:
                    for id_val in dupes[id_col].unique():
                        group = dupes[dupes[id_col] == id_val]
                        if group[other_col].nunique() > 1:
                            values = group[other_col].unique()
                            issues.append(f"ID {id_val} has conflicting {other_col}: {values}")
                            conflict_details.append(f"ID CONFLICT - {id_col}={id_val}:\n{group[[id_col, other_col]].to_string()}\n")

    # Check number ranges
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        if 'age' in col.lower():
            bad_rows = df[df[col] < 0]
            if not bad_rows.empty:
                issues.append(f"Negative age in {len(bad_rows)} rows")
                conflict_details.append(f"NEGATIVE AGE:\n{bad_rows[[col]].to_string()}\n")
        
        if any(x in col.lower() for x in ['price','salary','cost']):
            bad_rows = df[df[col] < 0]
            if not bad_rows.empty:
                issues.append(f"Negative values in {col}: {len(bad_rows)} rows")
                conflict_details.append(f"NEGATIVE VALUES in {col}:\n{bad_rows[[col]].to_string()}\n")

    # Check date logic
    date_cols = [col for col in df.columns if 'date' in col.lower()]
    for i, col1 in enumerate(date_cols):
        for col2 in date_cols[i+1:]:
            try:
                df_temp = df.copy()
                df_temp[col1] = pd.to_datetime(df_temp[col1], errors='coerce')
                df_temp[col2] = pd.to_datetime(df_temp[col2], errors='coerce')
                bad_rows = df_temp[df_temp[col1] > df_temp[col2]]
                if not bad_rows.empty:
                    issues.append(f"{col1} after {col2} in {len(bad_rows)} rows")
                    conflict_details.append(f"DATE CONFLICT {col1} > {col2}:\n{bad_rows[[col1, col2]].to_string()}\n")
            except:
                pass

    # Show conflict details if user wants
    if show_conflicts and conflict_details:
        print(f"\n🚨 CONFLICTING DATA LINES:")
        for detail in conflict_details:
            print(detail)
            print("-" * 50)

    return issues, conflict_details

def show_stats(df):
    """Show quick statistics"""
    print(f"\n📈 Quick stats:")
    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols[:3]:
        if col in df.columns:
            print(f"   {col}: {df[col].mean():.1f} avg, {df[col].min():.1f}-{df[col].max():.1f} range")

def main():
    print("🔍 Data Health Check")
    print("=" * 30)
    
    # Sample datasets - REPLACED iris.csv with your link
    samples = {
        "1": "https://raw.githubusercontent.com/Saif-Al-Sayam/IDP-2/refs/heads/main/sample-data",
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
    
    # Ask if user wants to see conflicting lines
    show_conflicts = input("\nWould you like to see the conflicting data lines? (y/n): ").strip().lower() == 'y'
    
    df = load_data(source)
    
    if df is not None and len(df) > 0:
        print(f"\nFirst look at the data:")
        print(df.head(2))
        
        issues, conflict_details = check_data(df, name, show_conflicts)
        show_stats(df)
        
        print(f"\n📊 Summary: {len(issues)} issues found")
        for issue in issues:
            print(f"   • {issue}")
        
        # Ask if user wants to save report
        save_report = input("\nWould you like to save the report to a text file? (y/n): ").strip().lower() == 'y'
        
        if save_report:
            filename = input("Enter filename (or press enter for auto-name): ").strip()
            if not filename:
                filename = f"data_check_report_{name}.txt"
            
            with open(filename, 'w') as f:
                f.write(f"DATA HEALTH CHECK REPORT\n")
                f.write("=" * 50 + "\n")
                f.write(f"Dataset: {name}\n")
                f.write(f"Total rows: {len(df)}, Total columns: {len(df.columns)}\n")
                f.write(f"Issues found: {len(issues)}\n\n")
                
                f.write("ISSUES SUMMARY:\n")
                for i, issue in enumerate(issues, 1):
                    f.write(f"{i}. {issue}\n")
                
                if conflict_details:
                    f.write("\nDETAILED CONFLICT DATA:\n")
                    f.write("=" * 50 + "\n")
                    for detail in conflict_details:
                        f.write(detail + "\n")
            
            print(f"💾 Report saved to {filename}")
        else:
            print("📝 Report not saved")
    
    else:
        print("❌ No data loaded - check the URL or file path")

if __name__ == "__main__":
    main()
